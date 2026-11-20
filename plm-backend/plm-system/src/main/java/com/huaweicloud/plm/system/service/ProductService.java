package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.ProductQuery;
import com.huaweicloud.plm.system.dto.ProductSaveRequest;
import com.huaweicloud.plm.system.entity.MdProduct;
import com.huaweicloud.plm.system.mapper.MdProductMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * 产品型号档案服务（DEV-017）。
 */
@Service
@RequiredArgsConstructor
public class ProductService {

    private final MdProductMapper productMapper;

    public PageResult<MdProduct> page(ProductQuery query) {
        Page<MdProduct> page = query.toPage();
        productMapper.selectPage(page, Wrappers.<MdProduct>lambdaQuery()
                .eq(StringUtils.hasText(query.getSeriesCode()), MdProduct::getSeriesCode, query.getSeriesCode())
                .eq(StringUtils.hasText(query.getCustomerCode()), MdProduct::getCustomerCode, query.getCustomerCode())
                .eq(StringUtils.hasText(query.getStatus()), MdProduct::getStatus, query.getStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(MdProduct::getProductCode, query.getKeyword()).or()
                        .like(MdProduct::getProductName, query.getKeyword()))
                .orderByDesc(MdProduct::getCreatedAt));
        return PageResult.of(page);
    }

    public MdProduct getById(Long productId) {
        return requireProduct(productId);
    }

    public List<MdProduct> options() {
        return productMapper.selectList(Wrappers.<MdProduct>lambdaQuery()
                .orderByAsc(MdProduct::getProductCode));
    }

    public Long create(ProductSaveRequest request) {
        if (productMapper.countByCode(request.getProductCode(), -1L) > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "产品编码已存在: " + request.getProductCode());
        }
        MdProduct product = new MdProduct();
        applyRequest(product, request);
        if (!StringUtils.hasText(product.getStatus())) {
            product.setStatus("draft");
        }
        productMapper.insert(product);
        return product.getId();
    }

    public void update(Long productId, ProductSaveRequest request) {
        MdProduct product = requireProduct(productId);
        if (!product.getProductCode().equals(request.getProductCode())
                && productMapper.countByCode(request.getProductCode(), productId) > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "产品编码已存在: " + request.getProductCode());
        }
        applyRequest(product, request);
        productMapper.updateById(product);
    }

    public void delete(Long productId) {
        requireProduct(productId);
        productMapper.deleteById(productId);
    }

    private void applyRequest(MdProduct product, ProductSaveRequest request) {
        product.setProductCode(request.getProductCode());
        product.setProductName(request.getProductName());
        product.setSeriesCode(request.getSeriesCode());
        product.setSeriesName(request.getSeriesName());
        product.setCustomerCode(request.getCustomerCode());
        product.setModel(request.getModel());
        product.setUnit(request.getUnit());
        if (StringUtils.hasText(request.getStatus())) {
            product.setStatus(request.getStatus());
        }
        product.setDescription(request.getDescription());
        product.setRemark(request.getRemark());
    }

    private MdProduct requireProduct(Long productId) {
        MdProduct product = productMapper.selectById(productId);
        if (product == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "产品型号不存在: " + productId);
        }
        return product;
    }
}
