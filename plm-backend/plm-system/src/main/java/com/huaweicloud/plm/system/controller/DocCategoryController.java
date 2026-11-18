package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.DocCategoryQuery;
import com.huaweicloud.plm.system.dto.DocCategorySaveRequest;
import com.huaweicloud.plm.system.entity.DocCategory;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.DocCategoryService;
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
 * 图文档分类接口（DEV-033）。
 */
@RestController
@RequestMapping("/document/categories")
@RequiredArgsConstructor
public class DocCategoryController {

    private final DocCategoryService docCategoryService;

    @GetMapping
    @RequirePermission("doc:category:list")
    public ApiResponse<PageResult<DocCategory>> page(DocCategoryQuery query) {
        return ApiResponse.success(docCategoryService.page(query));
    }

    @GetMapping("/options")
    @RequirePermission("doc:category:list")
    public ApiResponse<List<DocCategory>> options() {
        return ApiResponse.success(docCategoryService.options());
    }

    @GetMapping("/{categoryId}")
    @RequirePermission("doc:category:list")
    public ApiResponse<DocCategory> getById(@PathVariable Long categoryId) {
        return ApiResponse.success(docCategoryService.getById(categoryId));
    }

    @PostMapping
    @RequirePermission("doc:category:save")
    public ApiResponse<Long> create(@Valid @RequestBody DocCategorySaveRequest request) {
        return ApiResponse.success(docCategoryService.create(request));
    }

    @PutMapping("/{categoryId}")
    @RequirePermission("doc:category:save")
    public ApiResponse<Void> update(@PathVariable Long categoryId,
                                    @Valid @RequestBody DocCategorySaveRequest request) {
        docCategoryService.update(categoryId, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{categoryId}")
    @RequirePermission("doc:category:save")
    public ApiResponse<Void> delete(@PathVariable Long categoryId) {
        docCategoryService.delete(categoryId);
        return ApiResponse.success();
    }
}
