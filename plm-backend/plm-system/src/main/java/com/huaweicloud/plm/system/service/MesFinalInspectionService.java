package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.MesFinalInspectionQuery;
import com.huaweicloud.plm.system.dto.MesFinalInspectionSaveRequest;
import com.huaweicloud.plm.system.entity.MesFinalInspection;
import com.huaweicloud.plm.system.mapper.MesFinalInspectionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 终检记录服务。
 */
@Service
@RequiredArgsConstructor
public class MesFinalInspectionService {

    private static final String DEFAULT_NO_PREFIX = "MFI";
    private static final String DEFAULT_INSPECTION_STATUS = "PENDING";

    private final MesFinalInspectionMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<MesFinalInspection> page(MesFinalInspectionQuery query) {
        String keyword = query.getKeyword();
        Page<MesFinalInspection> page = mapper.selectPage(query.toPage(), Wrappers.<MesFinalInspection>lambdaQuery()
                .eq(StringUtils.hasText(query.getInspectionStatus()), MesFinalInspection::getInspectionStatus, query.getInspectionStatus())
                .eq(StringUtils.hasText(query.getInspectionResult()), MesFinalInspection::getInspectionResult, query.getInspectionResult())
                .eq(StringUtils.hasText(query.getWorkOrderNo()), MesFinalInspection::getWorkOrderNo, query.getWorkOrderNo())
                .eq(StringUtils.hasText(query.getMaterialCode()), MesFinalInspection::getMaterialCode, query.getMaterialCode())
                .eq(StringUtils.hasText(query.getCustomerCode()), MesFinalInspection::getCustomerCode, query.getCustomerCode())
                .and(StringUtils.hasText(keyword), w -> w
                        .like(MesFinalInspection::getFinalNo, keyword).or()
                        .like(MesFinalInspection::getWorkOrderNo, keyword).or()
                        .like(MesFinalInspection::getMaterialCode, keyword).or()
                        .like(MesFinalInspection::getCustomerCode, keyword))
                .orderByDesc(MesFinalInspection::getId));
        return PageResult.of(page);
    }

    public MesFinalInspection detail(Long id) {
        return require(id);
    }

    public Long save(Long id, MesFinalInspectionSaveRequest request) {
        MesFinalInspection entity;
        if (id == null) {
            entity = new MesFinalInspection();
            entity.setFinalNo(StringUtils.hasText(request.getFinalNo())
                    ? request.getFinalNo()
                    : flowSupport.nextBizNo(DEFAULT_NO_PREFIX));
            entity.setInspectionStatus(StringUtils.hasText(request.getInspectionStatus())
                    ? request.getInspectionStatus() : DEFAULT_INSPECTION_STATUS);
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

    private MesFinalInspection require(Long id) {
        MesFinalInspection entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "终检记录不存在: " + id);
        }
        return entity;
    }

    private void applyRequest(MesFinalInspection entity, MesFinalInspectionSaveRequest request) {
        if (StringUtils.hasText(request.getFinalNo())) {
            entity.setFinalNo(request.getFinalNo());
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
        if (StringUtils.hasText(request.getSpec())) {
            entity.setSpec(request.getSpec());
        }
        if (StringUtils.hasText(request.getBatchNo())) {
            entity.setBatchNo(request.getBatchNo());
        }
        if (request.getInspectionQty() != null) {
            entity.setInspectionQty(request.getInspectionQty());
        }
        if (request.getSampleQty() != null) {
            entity.setSampleQty(request.getSampleQty());
        }
        if (request.getQualifiedQty() != null) {
            entity.setQualifiedQty(request.getQualifiedQty());
        }
        if (request.getUnqualifiedQty() != null) {
            entity.setUnqualifiedQty(request.getUnqualifiedQty());
        }
        if (StringUtils.hasText(request.getInspectionResult())) {
            entity.setInspectionResult(request.getInspectionResult());
        }
        if (StringUtils.hasText(request.getInspectionStatus())) {
            entity.setInspectionStatus(request.getInspectionStatus());
        }
        if (StringUtils.hasText(request.getInspector())) {
            entity.setInspector(request.getInspector());
        }
        if (request.getInspectionTime() != null) {
            entity.setInspectionTime(request.getInspectionTime());
        }
        if (StringUtils.hasText(request.getJudgeNo())) {
            entity.setJudgeNo(request.getJudgeNo());
        }
        if (StringUtils.hasText(request.getCustomerCode())) {
            entity.setCustomerCode(request.getCustomerCode());
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
