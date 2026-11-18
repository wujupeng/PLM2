package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ProductQuery;
import com.huaweicloud.plm.system.dto.ProductSaveRequest;
import com.huaweicloud.plm.system.entity.MdProduct;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 产品型号档案接口（DEV-017）。
 */
@RestController
@RequestMapping("/product-data/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    @RequirePermission("product:list")
    public ApiResponse<PageResult<MdProduct>> page(ProductQuery query) {
        return ApiResponse.success(productService.page(query));
    }

    @GetMapping("/options")
    @RequirePermission("product:list")
    public ApiResponse<List<MdProduct>> options() {
        return ApiResponse.success(productService.options());
    }

    @GetMapping("/{productId}")
    @RequirePermission("product:list")
    public ApiResponse<MdProduct> getById(@PathVariable Long productId) {
        return ApiResponse.success(productService.getById(productId));
    }

    @PostMapping
    @RequirePermission("product:create")
    public ApiResponse<Long> create(@Valid @RequestBody ProductSaveRequest request) {
        return ApiResponse.success(productService.create(request));
    }

    @PutMapping("/{productId}")
    @RequirePermission("product:update")
    public ApiResponse<Void> update(@PathVariable Long productId, @Valid @RequestBody ProductSaveRequest request) {
        productService.update(productId, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{productId}")
    @RequirePermission("product:delete")
    public ApiResponse<Void> delete(@PathVariable Long productId) {
        productService.delete(productId);
        return ApiResponse.success();
    }
}
