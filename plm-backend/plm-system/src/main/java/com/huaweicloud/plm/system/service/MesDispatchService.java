package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.MesDispatchQuery;
import com.huaweicloud.plm.system.dto.MesDispatchSaveRequest;
import com.huaweicloud.plm.system.entity.MesDispatch;
import com.huaweicloud.plm.system.mapper.MesDispatchMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 派工任务服务。
 */
@Service
@RequiredArgsConstructor
public class MesDispatchService {

    private static final String DEFAULT_NO_PREFIX = "MDP";
    private static final String DEFAULT_DISPATCH_STATUS = "DRAFT";

    private final MesDispatchMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<MesDispatch> page(MesDispatchQuery query) {
        String keyword = query.getKeyword();
        Page<MesDispatch> page = mapper.selectPage(query.toPage(), Wrappers.<MesDispatch>lambdaQuery()
                .eq(StringUtils.hasText(query.getDispatchStatus()), MesDispatch::getDispatchStatus, query.getDispatchStatus())
                .eq(StringUtils.hasText(query.getProcessCode()), MesDispatch::getProcessCode, query.getProcessCode())
                .eq(StringUtils.hasText(query.getWorkOrderNo()), MesDispatch::getWorkOrderNo, query.getWorkOrderNo())
                .eq(StringUtils.hasText(query.getMaterialCode()), MesDispatch::getMaterialCode, query.getMaterialCode())
                .and(StringUtils.hasText(keyword), w -> w
                        .like(MesDispatch::getDispatchNo, keyword).or()
                        .like(MesDispatch::getWorkOrderNo, keyword).or()
                        .like(MesDispatch::getProcessCode, keyword).or()
                        .like(MesDispatch::getMaterialCode, keyword).or()
                        .like(MesDispatch::getMaterialName, keyword))
                .orderByDesc(MesDispatch::getId));
        return PageResult.of(page);
    }

    public MesDispatch detail(Long id) {
        return require(id);
    }

    public Long save(Long id, MesDispatchSaveRequest request) {
        MesDispatch entity;
        if (id == null) {
            entity = new MesDispatch();
            entity.setDispatchNo(StringUtils.hasText(request.getDispatchNo())
                    ? request.getDispatchNo()
                    : flowSupport.nextBizNo(DEFAULT_NO_PREFIX));
            entity.setDispatchStatus(StringUtils.hasText(request.getDispatchStatus())
                    ? request.getDispatchStatus() : DEFAULT_DISPATCH_STATUS);
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

    private MesDispatch require(Long id) {
        MesDispatch entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "派工任务不存在: " + id);
        }
        return entity;
    }

    private void applyRequest(MesDispatch entity, MesDispatchSaveRequest request) {
        if (StringUtils.hasText(request.getDispatchNo())) {
            entity.setDispatchNo(request.getDispatchNo());
        }
        if (StringUtils.hasText(request.getWorkOrderNo())) {
            entity.setWorkOrderNo(request.getWorkOrderNo());
        }
        if (StringUtils.hasText(request.getProcessCode())) {
            entity.setProcessCode(request.getProcessCode());
        }
        if (StringUtils.hasText(request.getProcessName())) {
            entity.setProcessName(request.getProcessName());
        }
        if (StringUtils.hasText(request.getEquipmentCode())) {
            entity.setEquipmentCode(request.getEquipmentCode());
        }
        if (StringUtils.hasText(request.getLineCode())) {
            entity.setLineCode(request.getLineCode());
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
        if (request.getDispatchedQty() != null) {
            entity.setDispatchedQty(request.getDispatchedQty());
        }
        if (request.getProgressQty() != null) {
            entity.setProgressQty(request.getProgressQty());
        }
        if (request.getProgressRate() != null) {
            entity.setProgressRate(request.getProgressRate());
        }
        if (StringUtils.hasText(request.getDispatchStatus())) {
            entity.setDispatchStatus(request.getDispatchStatus());
        }
        if (StringUtils.hasText(request.getOperator())) {
            entity.setOperator(request.getOperator());
        }
        if (request.getDispatchTime() != null) {
            entity.setDispatchTime(request.getDispatchTime());
        }
        if (request.getFeedbackTime() != null) {
            entity.setFeedbackTime(request.getFeedbackTime());
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
