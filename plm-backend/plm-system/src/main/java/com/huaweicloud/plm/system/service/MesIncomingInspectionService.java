package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.MesIncomingInspectionQuery;
import com.huaweicloud.plm.system.dto.MesIncomingInspectionSaveRequest;
import com.huaweicloud.plm.system.entity.MesIncomingInspection;
import com.huaweicloud.plm.system.mapper.MesIncomingInspectionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 来料检验单服务。
 */
@Service
@RequiredArgsConstructor
public class MesIncomingInspectionService {

    private static final String DEFAULT_NO_PREFIX = "MIQ";
    private static final String DEFAULT_INSPECTION_STATUS = "PENDING";

    private final MesIncomingInspectionMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<MesIncomingInspection> page(MesIncomingInspectionQuery query) {
        String keyword = query.getKeyword();
        Page<MesIncomingInspection> page = mapper.selectPage(query.toPage(), Wrappers.<MesIncomingInspection>lambdaQuery()
                .eq(StringUtils.hasText(query.getInspectionStatus()), MesIncomingInspection::getInspectionStatus, query.getInspectionStatus())
                .eq(StringUtils.hasText(query.getInspectionResult()), MesIncomingInspection::getInspectionResult, query.getInspectionResult())
                .eq(StringUtils.hasText(query.getMaterialCode()), MesIncomingInspection::getMaterialCode, query.getMaterialCode())
                .eq(StringUtils.hasText(query.getSupplierCode()), MesIncomingInspection::getSupplierCode, query.getSupplierCode())
                .and(StringUtils.hasText(keyword), w -> w
                        .like(MesIncomingInspection::getIncomingNo, keyword).or()
                        .like(MesIncomingInspection::getMaterialCode, keyword).or()
                        .like(MesIncomingInspection::getMaterialName, keyword).or()
                        .like(MesIncomingInspection::getSupplierName, keyword))
                .orderByDesc(MesIncomingInspection::getId));
        return PageResult.of(page);
    }

    public MesIncomingInspection detail(Long id) {
        return require(id);
    }

    public Long save(Long id, MesIncomingInspectionSaveRequest request) {
        MesIncomingInspection entity;
        if (id == null) {
            entity = new MesIncomingInspection();
            entity.setIncomingNo(StringUtils.hasText(request.getIncomingNo())
                    ? request.getIncomingNo()
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

    private MesIncomingInspection require(Long id) {
        MesIncomingInspection entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "来料检验单不存在: " + id);
        }
        return entity;
    }

    private void applyRequest(MesIncomingInspection entity, MesIncomingInspectionSaveRequest request) {
        if (StringUtils.hasText(request.getIncomingNo())) {
            entity.setIncomingNo(request.getIncomingNo());
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
        if (StringUtils.hasText(request.getSupplierCode())) {
            entity.setSupplierCode(request.getSupplierCode());
        }
        if (StringUtils.hasText(request.getSupplierName())) {
            entity.setSupplierName(request.getSupplierName());
        }
        if (StringUtils.hasText(request.getPurchaseOrderNo())) {
            entity.setPurchaseOrderNo(request.getPurchaseOrderNo());
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
