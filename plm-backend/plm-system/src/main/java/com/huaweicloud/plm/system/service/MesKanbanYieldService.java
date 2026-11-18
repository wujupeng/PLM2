package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.MesKanbanYieldQuery;
import com.huaweicloud.plm.system.dto.MesKanbanYieldSaveRequest;
import com.huaweicloud.plm.system.entity.MesKanbanYield;
import com.huaweicloud.plm.system.mapper.MesKanbanYieldMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 良率看板记录服务。
 */
@Service
@RequiredArgsConstructor
public class MesKanbanYieldService {

    private static final String DEFAULT_NO_PREFIX = "MKY";
    private static final String DEFAULT_RECORD_STATUS = "DRAFT";

    private final MesKanbanYieldMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<MesKanbanYield> page(MesKanbanYieldQuery query) {
        String keyword = query.getKeyword();
        Page<MesKanbanYield> page = mapper.selectPage(query.toPage(), Wrappers.<MesKanbanYield>lambdaQuery()
                .eq(StringUtils.hasText(query.getRecordStatus()), MesKanbanYield::getRecordStatus, query.getRecordStatus())
                .eq(StringUtils.hasText(query.getMaterialCode()), MesKanbanYield::getMaterialCode, query.getMaterialCode())
                .eq(StringUtils.hasText(query.getLineCode()), MesKanbanYield::getLineCode, query.getLineCode())
                .eq(StringUtils.hasText(query.getShiftCode()), MesKanbanYield::getShiftCode, query.getShiftCode())
                .and(StringUtils.hasText(keyword), w -> w
                        .like(MesKanbanYield::getYieldNo, keyword).or()
                        .like(MesKanbanYield::getMaterialCode, keyword).or()
                        .like(MesKanbanYield::getMaterialName, keyword).or()
                        .like(MesKanbanYield::getLineCode, keyword))
                .orderByDesc(MesKanbanYield::getId));
        return PageResult.of(page);
    }

    public MesKanbanYield detail(Long id) {
        return require(id);
    }

    public Long save(Long id, MesKanbanYieldSaveRequest request) {
        MesKanbanYield entity;
        if (id == null) {
            entity = new MesKanbanYield();
            entity.setYieldNo(StringUtils.hasText(request.getYieldNo())
                    ? request.getYieldNo()
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

    private MesKanbanYield require(Long id) {
        MesKanbanYield entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "良率看板记录不存在: " + id);
        }
        return entity;
    }

    private void applyRequest(MesKanbanYield entity, MesKanbanYieldSaveRequest request) {
        if (StringUtils.hasText(request.getYieldNo())) {
            entity.setYieldNo(request.getYieldNo());
        }
        if (StringUtils.hasText(request.getMaterialCode())) {
            entity.setMaterialCode(request.getMaterialCode());
        }
        if (StringUtils.hasText(request.getMaterialName())) {
            entity.setMaterialName(request.getMaterialName());
        }
        if (StringUtils.hasText(request.getLineCode())) {
            entity.setLineCode(request.getLineCode());
        }
        if (StringUtils.hasText(request.getShiftCode())) {
            entity.setShiftCode(request.getShiftCode());
        }
        if (request.getInputQty() != null) {
            entity.setInputQty(request.getInputQty());
        }
        if (request.getQualifiedQty() != null) {
            entity.setQualifiedQty(request.getQualifiedQty());
        }
        if (request.getUnqualifiedQty() != null) {
            entity.setUnqualifiedQty(request.getUnqualifiedQty());
        }
        if (request.getYieldRate() != null) {
            entity.setYieldRate(request.getYieldRate());
        }
        if (request.getStatDate() != null) {
            entity.setStatDate(request.getStatDate());
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
