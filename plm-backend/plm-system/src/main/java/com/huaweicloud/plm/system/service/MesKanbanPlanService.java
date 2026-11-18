package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.MesKanbanPlanQuery;
import com.huaweicloud.plm.system.dto.MesKanbanPlanSaveRequest;
import com.huaweicloud.plm.system.entity.MesKanbanPlan;
import com.huaweicloud.plm.system.mapper.MesKanbanPlanMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 计划达成记录服务。
 */
@Service
@RequiredArgsConstructor
public class MesKanbanPlanService {

    private static final String DEFAULT_NO_PREFIX = "MKP";
    private static final String DEFAULT_RECORD_STATUS = "DRAFT";

    private final MesKanbanPlanMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<MesKanbanPlan> page(MesKanbanPlanQuery query) {
        String keyword = query.getKeyword();
        Page<MesKanbanPlan> page = mapper.selectPage(query.toPage(), Wrappers.<MesKanbanPlan>lambdaQuery()
                .eq(StringUtils.hasText(query.getRecordStatus()), MesKanbanPlan::getRecordStatus, query.getRecordStatus())
                .eq(StringUtils.hasText(query.getWorkOrderNo()), MesKanbanPlan::getWorkOrderNo, query.getWorkOrderNo())
                .eq(StringUtils.hasText(query.getMaterialCode()), MesKanbanPlan::getMaterialCode, query.getMaterialCode())
                .eq(StringUtils.hasText(query.getLineCode()), MesKanbanPlan::getLineCode, query.getLineCode())
                .and(StringUtils.hasText(keyword), w -> w
                        .like(MesKanbanPlan::getPlanNo, keyword).or()
                        .like(MesKanbanPlan::getWorkOrderNo, keyword).or()
                        .like(MesKanbanPlan::getMaterialCode, keyword).or()
                        .like(MesKanbanPlan::getMaterialName, keyword))
                .orderByDesc(MesKanbanPlan::getId));
        return PageResult.of(page);
    }

    public MesKanbanPlan detail(Long id) {
        return require(id);
    }

    public Long save(Long id, MesKanbanPlanSaveRequest request) {
        MesKanbanPlan entity;
        if (id == null) {
            entity = new MesKanbanPlan();
            entity.setPlanNo(StringUtils.hasText(request.getPlanNo())
                    ? request.getPlanNo()
                    : flowSupport.nextBizNo(DEFAULT_NO_PREFIX));
            entity.setRecordStatus(StringUtils.hasText(request.getRecordStatus())
                    ? request.getRecordStatus() : DEFAULT_RECORD_STATUS);
            entity.setOrgId(currentOrgId());
            applyRequest(entity, request);
            mapper.insert(entity);
        } else {
            entity = require(id);
            applyRequest(entity, request);
            mapper.updateById(entity);
        }
        return entity.getId();
    }

    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    private MesKanbanPlan require(Long id) {
        MesKanbanPlan entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "计划达成记录不存在: " + id);
        }
        return entity;
    }

    private void applyRequest(MesKanbanPlan entity, MesKanbanPlanSaveRequest request) {
        if (StringUtils.hasText(request.getPlanNo())) {
            entity.setPlanNo(request.getPlanNo());
        }
        if (StringUtils.hasText(request.getWorkOrderNo())) {
            entity.setWorkOrderNo(request.getWorkOrderNo());
        }
        if (StringUtils.hasText(request.getMaterialCode())) {
            entity.setMaterialCode(request.getMaterialCode());
        }
        if (StringUtils.hasText(request.getMaterialName())) {
            entity.setMaterialName(request.getMaterialName());
        }
        if (request.getPlanQty() != null) {
            entity.setPlanQty(request.getPlanQty());
        }
        if (request.getFinishQty() != null) {
            entity.setFinishQty(request.getFinishQty());
        }
        if (request.getAchieveRate() != null) {
            entity.setAchieveRate(request.getAchieveRate());
        }
        if (request.getPlanDate() != null) {
            entity.setPlanDate(request.getPlanDate());
        }
        if (StringUtils.hasText(request.getLineCode())) {
            entity.setLineCode(request.getLineCode());
        }
        if (StringUtils.hasText(request.getShiftCode())) {
            entity.setShiftCode(request.getShiftCode());
        }
        if (StringUtils.hasText(request.getRecordStatus())) {
            entity.setRecordStatus(request.getRecordStatus());
        }
        if (StringUtils.hasText(request.getOrgName())) {
            entity.setOrgName(request.getOrgName());
        }
        if (StringUtils.hasText(request.getDescription())) {
            entity.setDescription(request.getDescription());
        }
        if (StringUtils.hasText(request.getRemark())) {
            entity.setRemark(request.getRemark());
        }
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
