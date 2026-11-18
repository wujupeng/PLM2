package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.SrmDeliveryCommitmentQuery;
import com.huaweicloud.plm.system.dto.SrmDeliveryCommitmentSaveRequest;
import com.huaweicloud.plm.system.entity.SrmDeliveryCommitment;
import com.huaweicloud.plm.system.mapper.SrmDeliveryCommitmentMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * SRM 采购协同—交期承诺（对应交期承诺）：
 * 交期承诺登记、分页查询与删除。
 * 交期承诺编号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SrmDeliveryCommitmentService {

    private static final String DEFAULT_COMMITMENT_NO_PREFIX = "DCM";
    private static final String DEFAULT_COMMITMENT_STATUS = "PENDING";

    private final SrmDeliveryCommitmentMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询交期承诺记录：承诺状态/供应商编码/采购订单号精确，交期承诺编号/采购订单号/供应商编码/供应商名称/物料编码模糊，按主键倒序。 */
    public PageResult<SrmDeliveryCommitment> page(SrmDeliveryCommitmentQuery query) {
        Page<SrmDeliveryCommitment> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SrmDeliveryCommitment>lambdaQuery()
                .eq(StringUtils.hasText(query.getCommitmentStatus()),
                        SrmDeliveryCommitment::getCommitmentStatus, query.getCommitmentStatus())
                .eq(StringUtils.hasText(query.getSupplierCode()),
                        SrmDeliveryCommitment::getSupplierCode, query.getSupplierCode())
                .eq(StringUtils.hasText(query.getPoNo()),
                        SrmDeliveryCommitment::getPoNo, query.getPoNo())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SrmDeliveryCommitment::getCommitmentNo, query.getKeyword()).or()
                        .like(SrmDeliveryCommitment::getPoNo, query.getKeyword()).or()
                        .like(SrmDeliveryCommitment::getSupplierCode, query.getKeyword()).or()
                        .like(SrmDeliveryCommitment::getSupplierName, query.getKeyword()).or()
                        .like(SrmDeliveryCommitment::getMaterialCode, query.getKeyword()))
                .orderByDesc(SrmDeliveryCommitment::getId));
        return PageResult.of(page);
    }

    public SrmDeliveryCommitment detail(Long id) {
        return require(id);
    }

    /** 新增或更新交期承诺记录：新增时回填默认承诺状态与组织，交期承诺编号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SrmDeliveryCommitmentSaveRequest request) {
        SrmDeliveryCommitment entity;
        if (id == null) {
            entity = new SrmDeliveryCommitment();
            entity.setCommitmentNo(StringUtils.hasText(request.getCommitmentNo())
                    ? request.getCommitmentNo() : flowSupport.nextBizNo(DEFAULT_COMMITMENT_NO_PREFIX));
            entity.setCommitmentStatus(StringUtils.hasText(request.getCommitmentStatus())
                    ? request.getCommitmentStatus() : DEFAULT_COMMITMENT_STATUS);
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

    /** 删除交期承诺记录：物理删除以释放交期承诺编号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public SrmDeliveryCommitment require(Long id) {
        SrmDeliveryCommitment entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "交期承诺单不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖实体对应字段。 */
    private void applyRequest(SrmDeliveryCommitment entity, SrmDeliveryCommitmentSaveRequest request) {
        if (StringUtils.hasText(request.getCommitmentNo())) {
            entity.setCommitmentNo(request.getCommitmentNo());
        }
        if (StringUtils.hasText(request.getConfirmNo())) {
            entity.setConfirmNo(request.getConfirmNo());
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
        if (request.getCommitmentQty() != null) {
            entity.setCommitmentQty(request.getCommitmentQty());
        }
        if (StringUtils.hasText(request.getUnit())) {
            entity.setUnit(request.getUnit());
        }
        if (request.getRequireDate() != null) {
            entity.setRequireDate(request.getRequireDate());
        }
        if (request.getPromiseDate() != null) {
            entity.setPromiseDate(request.getPromiseDate());
        }
        if (request.getDelayDays() != null) {
            entity.setDelayDays(request.getDelayDays());
        }
        if (StringUtils.hasText(request.getDelayReason())) {
            entity.setDelayReason(request.getDelayReason());
        }
        if (StringUtils.hasText(request.getCommitBy())) {
            entity.setCommitBy(request.getCommitBy());
        }
        if (request.getCommitDate() != null) {
            entity.setCommitDate(request.getCommitDate());
        }
        if (StringUtils.hasText(request.getCommitmentStatus())) {
            entity.setCommitmentStatus(request.getCommitmentStatus());
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
