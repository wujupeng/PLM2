package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.EdiSupplierMaterialQuery;
import com.huaweicloud.plm.system.dto.EdiSupplierMaterialSaveRequest;
import com.huaweicloud.plm.system.entity.EdiSupplierMaterial;
import com.huaweicloud.plm.system.mapper.EdiSupplierMaterialMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.List;

/**
 * 供应商供货关系与分配规则服务（N6，DEV-070）。
 */
@Service
@RequiredArgsConstructor
public class EdiSupplierMaterialService {

    private static final BigDecimal DEFAULT_SHARE_PCT = new BigDecimal("100.00");
    private static final int DEFAULT_PRIORITY = 1;
    private static final String DEFAULT_SEND_CHANNEL = "API";
    private static final int STATUS_ENABLED = 1;

    private final EdiSupplierMaterialMapper ediSupplierMaterialMapper;

    public PageResult<EdiSupplierMaterial> page(EdiSupplierMaterialQuery query) {
        Page<EdiSupplierMaterial> page = query.toPage();
        ediSupplierMaterialMapper.selectPage(page, Wrappers.<EdiSupplierMaterial>lambdaQuery()
                .eq(StringUtils.hasText(query.getSupplierCode()), EdiSupplierMaterial::getSupplierCode, query.getSupplierCode())
                .eq(StringUtils.hasText(query.getMaterialCode()), EdiSupplierMaterial::getMaterialCode, query.getMaterialCode())
                .eq(query.getStatus() != null, EdiSupplierMaterial::getStatus, query.getStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(EdiSupplierMaterial::getSupplierCode, query.getKeyword()).or()
                        .like(EdiSupplierMaterial::getMaterialCode, query.getKeyword()))
                .orderByAsc(EdiSupplierMaterial::getSupplierCode)
                .orderByAsc(EdiSupplierMaterial::getMaterialCode));
        return PageResult.of(page);
    }

    public List<EdiSupplierMaterial> listByMaterial(String materialCode) {
        return ediSupplierMaterialMapper.selectList(Wrappers.<EdiSupplierMaterial>lambdaQuery()
                .eq(EdiSupplierMaterial::getMaterialCode, materialCode)
                .eq(EdiSupplierMaterial::getStatus, STATUS_ENABLED)
                .orderByAsc(EdiSupplierMaterial::getPriority)
                .orderByDesc(EdiSupplierMaterial::getSharePct));
    }

    public List<EdiSupplierMaterial> listBySupplier(String supplierCode) {
        return ediSupplierMaterialMapper.selectList(Wrappers.<EdiSupplierMaterial>lambdaQuery()
                .eq(EdiSupplierMaterial::getSupplierCode, supplierCode)
                .orderByAsc(EdiSupplierMaterial::getPriority)
                .orderByAsc(EdiSupplierMaterial::getMaterialCode));
    }

    public EdiSupplierMaterial requireById(Long id) {
        EdiSupplierMaterial supplierMaterial = ediSupplierMaterialMapper.selectById(id);
        if (supplierMaterial == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "供应商供货关系不存在: " + id);
        }
        return supplierMaterial;
    }

    public Long create(EdiSupplierMaterialSaveRequest request) {
        ensureUnique(request.getSupplierCode(), request.getMaterialCode(), -1L);
        EdiSupplierMaterial supplierMaterial = new EdiSupplierMaterial();
        applyRequest(supplierMaterial, request);
        ediSupplierMaterialMapper.insert(supplierMaterial);
        return supplierMaterial.getId();
    }

    public void update(Long id, EdiSupplierMaterialSaveRequest request) {
        EdiSupplierMaterial supplierMaterial = requireById(id);
        ensureUnique(request.getSupplierCode(), request.getMaterialCode(), id);
        applyRequest(supplierMaterial, request);
        ediSupplierMaterialMapper.updateById(supplierMaterial);
    }

    public void delete(Long id) {
        requireById(id);
        ediSupplierMaterialMapper.deleteById(id);
    }

    private void applyRequest(EdiSupplierMaterial supplierMaterial, EdiSupplierMaterialSaveRequest request) {
        supplierMaterial.setSupplierCode(request.getSupplierCode());
        supplierMaterial.setSupplierName(request.getSupplierName());
        supplierMaterial.setMaterialCode(request.getMaterialCode());
        supplierMaterial.setSharePct(request.getSharePct() == null ? DEFAULT_SHARE_PCT : request.getSharePct());
        supplierMaterial.setLeadTimeDays(request.getLeadTimeDays());
        supplierMaterial.setPriority(request.getPriority() == null ? DEFAULT_PRIORITY : request.getPriority());
        supplierMaterial.setSendChannel(StringUtils.hasText(request.getSendChannel())
                ? request.getSendChannel() : DEFAULT_SEND_CHANNEL);
        supplierMaterial.setStatus(request.getStatus() == null ? STATUS_ENABLED : request.getStatus());
        supplierMaterial.setRemark(request.getRemark());
    }

    private void ensureUnique(String supplierCode, String materialCode, Long excludeId) {
        long count = ediSupplierMaterialMapper.selectCount(Wrappers.<EdiSupplierMaterial>lambdaQuery()
                .eq(EdiSupplierMaterial::getSupplierCode, supplierCode)
                .eq(EdiSupplierMaterial::getMaterialCode, materialCode)
                .ne(excludeId != null && excludeId > 0, EdiSupplierMaterial::getId, excludeId));
        if (count > 0) {
            throw new BusinessException(ResultCode.CONFLICT,
                    "供应商供货关系已存在: " + supplierCode + "/" + materialCode);
        }
    }
}
