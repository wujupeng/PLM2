package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.SpecPackagingQuery;
import com.huaweicloud.plm.system.dto.SpecPackagingSaveRequest;
import com.huaweicloud.plm.system.entity.SpecPackaging;
import com.huaweicloud.plm.system.mapper.SpecPackagingMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * 包装与标签技术要求服务（DEV-046）。
 */
@Service
@RequiredArgsConstructor
public class PackagingService {

    private static final String DEFAULT_VERSION = "V1";
    private static final String DEFAULT_STATUS = "draft";
    private static final String STATUS_RELEASED = "released";

    private final SpecPackagingMapper packagingMapper;

    public PageResult<SpecPackaging> page(SpecPackagingQuery query) {
        Page<SpecPackaging> page = query.toPage();
        packagingMapper.selectPage(page, Wrappers.<SpecPackaging>lambdaQuery()
                .eq(StringUtils.hasText(query.getPackagingCode()),
                        SpecPackaging::getPackagingCode, query.getPackagingCode())
                .eq(StringUtils.hasText(query.getProductCode()), SpecPackaging::getProductCode, query.getProductCode())
                .eq(StringUtils.hasText(query.getCustomerCode()), SpecPackaging::getCustomerCode, query.getCustomerCode())
                .eq(StringUtils.hasText(query.getStatus()), SpecPackaging::getStatus, query.getStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SpecPackaging::getPackagingCode, query.getKeyword()).or()
                        .like(SpecPackaging::getProductCode, query.getKeyword()).or()
                        .like(SpecPackaging::getProductName, query.getKeyword()))
                .orderByDesc(SpecPackaging::getCreatedAt));
        return PageResult.of(page);
    }

    public SpecPackaging getById(Long packagingId) {
        return requirePackaging(packagingId);
    }

    public List<SpecPackaging> listByProduct(String productCode) {
        return packagingMapper.selectList(Wrappers.<SpecPackaging>lambdaQuery()
                .eq(SpecPackaging::getProductCode, productCode)
                .orderByAsc(SpecPackaging::getId));
    }

    @Transactional
    public Long create(SpecPackagingSaveRequest request) {
        String versionNo = StringUtils.hasText(request.getVersionNo()) ? request.getVersionNo() : DEFAULT_VERSION;
        if (packagingMapper.countByCode(request.getPackagingCode(), versionNo, -1L) > 0) {
            throw new BusinessException(ResultCode.CONFLICT,
                    "包装规格编码 + 版本号已存在: " + request.getPackagingCode() + "/" + versionNo);
        }
        SpecPackaging packaging = new SpecPackaging();
        applyRequest(packaging, request, versionNo);
        packagingMapper.insert(packaging);
        return packaging.getId();
    }

    @Transactional
    public void update(Long packagingId, SpecPackagingSaveRequest request) {
        SpecPackaging packaging = requirePackaging(packagingId);
        String versionNo = StringUtils.hasText(request.getVersionNo()) ? request.getVersionNo() : packaging.getVersionNo();
        if ((!packaging.getPackagingCode().equals(request.getPackagingCode())
                || !packaging.getVersionNo().equals(versionNo))
                && packagingMapper.countByCode(request.getPackagingCode(), versionNo, packagingId) > 0) {
            throw new BusinessException(ResultCode.CONFLICT,
                    "包装规格编码 + 版本号已存在: " + request.getPackagingCode() + "/" + versionNo);
        }
        applyRequest(packaging, request, versionNo);
        packagingMapper.updateById(packaging);
    }

    @Transactional
    public void delete(Long packagingId) {
        requirePackaging(packagingId);
        packagingMapper.deleteById(packagingId);
    }

    @Transactional
    public void release(Long packagingId) {
        SpecPackaging packaging = requirePackaging(packagingId);
        if (packaging.getPackQty() == null || packaging.getPackQty() <= 0) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "包装数量必须大于 0 才能发布");
        }
        if (!StringUtils.hasText(packaging.getLabelTemplateCode())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "标签模板编码不能为空才能发布");
        }
        packaging.setStatus(STATUS_RELEASED);
        packagingMapper.updateById(packaging);
    }

    private void applyRequest(SpecPackaging packaging, SpecPackagingSaveRequest request, String versionNo) {
        packaging.setPackagingCode(request.getPackagingCode());
        packaging.setProductCode(request.getProductCode());
        packaging.setProductName(request.getProductName());
        packaging.setCustomerCode(request.getCustomerCode());
        packaging.setVersionNo(versionNo);
        packaging.setPackQty(request.getPackQty());
        packaging.setLabelTemplateCode(request.getLabelTemplateCode());
        packaging.setQrRuleKey(request.getQrRuleKey());
        packaging.setPackagingMaterial(request.getPackagingMaterial());
        packaging.setDimensionText(request.getDimensionText());
        packaging.setSpecialRequirement(request.getSpecialRequirement());
        packaging.setStatus(StringUtils.hasText(request.getStatus())
                ? request.getStatus()
                : (packaging.getStatus() == null ? DEFAULT_STATUS : packaging.getStatus()));
        packaging.setEffectiveDate(request.getEffectiveDate());
        packaging.setRemark(request.getRemark());
    }

    private SpecPackaging requirePackaging(Long packagingId) {
        SpecPackaging packaging = packagingMapper.selectById(packagingId);
        if (packaging == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "包装规格不存在: " + packagingId);
        }
        return packaging;
    }
}
