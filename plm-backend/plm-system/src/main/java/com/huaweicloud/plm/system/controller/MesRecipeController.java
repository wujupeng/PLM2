package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MesRecipeQuery;
import com.huaweicloud.plm.system.dto.MesRecipeSaveRequest;
import com.huaweicloud.plm.system.entity.MesRecipe;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MesRecipeService;
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

/**
 * 参数配方接口：配方登记、分页查询与删除。
 */
@RestController
@RequestMapping("/mes/craft/recipes")
@RequiredArgsConstructor
public class MesRecipeController {

    private final MesRecipeService service;

    @GetMapping
    @RequirePermission("mes:craft:recipe:list")
    public ApiResponse<PageResult<MesRecipe>> page(MesRecipeQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("mes:craft:recipe:list")
    public ApiResponse<MesRecipe> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("mes:craft:recipe:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MesRecipeSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("mes:craft:recipe:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody MesRecipeSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("mes:craft:recipe:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
