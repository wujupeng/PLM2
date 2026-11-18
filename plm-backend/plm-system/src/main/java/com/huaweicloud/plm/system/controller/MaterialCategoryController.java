package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.system.dto.MaterialCategorySaveRequest;
import com.huaweicloud.plm.system.entity.MdMaterialCategory;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MaterialCategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 物料分类接口（DEV-018）。
 */
@RestController
@RequestMapping("/product-data/material-categories")
@RequiredArgsConstructor
public class MaterialCategoryController {

    private final MaterialCategoryService materialCategoryService;

    @GetMapping
    @RequirePermission("material:list")
    public ApiResponse<List<MdMaterialCategory>> list(@RequestParam(required = false) String keyword) {
        return ApiResponse.success(materialCategoryService.list(keyword));
    }

    @PostMapping
    @RequirePermission("material:create")
    public ApiResponse<Long> create(@Valid @RequestBody MaterialCategorySaveRequest request) {
        return ApiResponse.success(materialCategoryService.create(request));
    }

    @PutMapping("/{categoryId}")
    @RequirePermission("material:update")
    public ApiResponse<Void> update(@PathVariable Long categoryId,
                                    @Valid @RequestBody MaterialCategorySaveRequest request) {
        materialCategoryService.update(categoryId, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{categoryId}")
    @RequirePermission("material:delete")
    public ApiResponse<Void> delete(@PathVariable Long categoryId) {
        materialCategoryService.delete(categoryId);
        return ApiResponse.success();
    }
}
