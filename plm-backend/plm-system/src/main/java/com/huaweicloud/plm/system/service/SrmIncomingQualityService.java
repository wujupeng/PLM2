package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.SrmIncomingQualityQuery;
import com.huaweicloud.plm.system.dto.SrmIncomingQualitySaveRequest;
import com.huaweicloud.plm.system.entity.SrmIncomingQuality;
import com.huaweicloud.plm.system.mapper.SrmIncomingQualityMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * SRM 供应商质量—来料质量（对应来料质量）：
 * 来料检验单登记、分页查询与删除。
 * 来料检验单号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SrmIncomingQualityService {

    private static final String DEFAULT_IQC_NO_PREFIX = "IQC";
    private static final String DEFAULT_INSPECTION_RESULT = "PENDING";
    private static final String DEFAULT_IQC_STATUS = "DRAFT";

    private final SrmIncomingQualityMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询来料检验单：检验结果/检验状态/供应商编码/采购订单号精确，来料检验单号/采购订单号/供应商编码/供应商名称/物料编码模糊，按主键倒序。 */
    public PageResult<SrmIncomingQuality> page(SrmIncomingQualityQuery query) {
        Page<SrmIncomingQuality> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SrmIncomingQuality>lambdaQuery()
                .eq(StringUtils.hasText(query.getInspectionResult()),
                        SrmIncomingQuality::getInspectionResult, query.getInspectionResult())
                .eq(StringUtils.hasText(query.getIqcStatus()),
                        SrmIncomingQuality::getIqcStatus, query.getIqcStatus())
                .eq(StringUtils.hasText(query.getSupplierCode()),
                        SrmIncomingQuality::getSupplierCode, query.getSupplierCode())
                .eq(StringUtils.hasText(query.getPoNo()),
                        SrmIncomingQuality::getPoNo, query.getPoNo())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SrmIncomingQuality::getIqcNo, query.getKeyword()).or()
                        .like(SrmIncomingQuality::getPoNo, query.getKeyword()).or()
                        .like(SrmIncomingQuality::getSupplierCode, query.getKeyword()).or()
                        .like(SrmIncomingQuality::getSupplierName, query.getKeyword()).or()
                        .like(SrmIncomingQuality::getMaterialCode, query.getKeyword()))
                .orderByDesc(SrmIncomingQuality::getId));
        return PageResult.of(page);
    }

    public SrmIncomingQuality detail(Long id) {
        return require(id);
    }

    /** 新增或更新来料检验单：新增时回填默认检验结果/检验状态与组织，来料检验单号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SrmIncomingQualitySaveRequest request) {
        SrmIncomingQuality entity;
        if (id == null) {
            entity = new SrmIncomingQuality();
            entity.setIqcNo(StringUtils.hasText(request.getIqcNo())
                    ? request.getIqcNo() : flowSupport.nextBizNo(DEFAULT_IQC_NO_PREFIX));
            entity.setInspectionResult(StringUtils.hasText(request.getInspectionResult())
                    ? request.getInspectionResult() : DEFAULT_INSPECTION_RESULT);
            entity.setIqcStatus(StringUtils.hasText(request.getIqcStatus())
                    ? request.getIqcStatus() : DEFAULT_IQC_STATUS);
            entity.setOrgId(currentOrgId());
        } else {
            entity = require(id);
        }
        applyRequest(entity, request);
        if (id == null) {
            mapper.insert(entity);
        } else {
            mapper.updateById(entity);
        }
        return entity.getId();
    }

    /** 删除来料检验单：物理删除以释放来料检验单号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public SrmIncomingQuality require(Long id) {
        SrmIncomingQuality entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "来料检验单不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖实体对应字段。 */
    private void applyRequest(SrmIncomingQuality entity, SrmIncomingQualitySaveRequest request) {
        if (StringUtils.hasText(request.getIqcNo())) {
            entity.setIqcNo(request.getIqcNo());
        }
        if (StringUtils.hasText(request.getPoNo())) {
            entity.setPoNo(request.getPoNo());
        }
        if (StringUtils.hasText(request.getSupplierCode())) {
            entity.setSupplierCode(request.getSupplierCode());
        }
        if (StringUtils.hasText(request.getSupplierName())) {
            entity.setSupplierName(request.getSupplierName());
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
        if (request.getReceiveQty() != null) {
            entity.setReceiveQty(request.getReceiveQty());
        }
        if (StringUtils.hasText(request.getUnit())) {
            entity.setUnit(request.getUnit());
        }
        if (request.getSampleQty() != null) {
            entity.setSampleQty(request.getSampleQty());
        }
        if (request.getDefectQty() != null) {
            entity.setDefectQty(request.getDefectQty());
        }
        if (request.getDefectRate() != null) {
            entity.setDefectRate(request.getDefectRate());
        }
        if (StringUtils.hasText(request.getInspectionResult())) {
            entity.setInspectionResult(request.getInspectionResult());
        }
        if (StringUtils.hasText(request.getDefectDesc())) {
            entity.setDefectDesc(request.getDefectDesc());
        }
        if (StringUtils.hasText(request.getInspector())) {
            entity.setInspector(request.getInspector());
        }
        if (request.getInspectDate() != null) {
            entity.setInspectDate(request.getInspectDate());
        }
        if (StringUtils.hasText(request.getIqcStatus())) {
            entity.setIqcStatus(request.getIqcStatus());
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
