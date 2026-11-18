package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ErpMaterialQuery;
import com.huaweicloud.plm.system.dto.ErpMaterialSaveRequest;
import com.huaweicloud.plm.system.entity.ErpMaterial;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ErpMaterialService;
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
 * 物料业务档案接口（G3-N1 ERP 基础资料 WBS T021）：
 * 物料档案登记、分页查询与删除。
 */
@RestController
@RequestMapping("/erp/base/materials")
@RequiredArgsConstructor
public class ErpMaterialController {

    private final ErpMaterialService service;

    @GetMapping
    @RequirePermission("erp:base:material:list")
    public ApiResponse<PageResult<ErpMaterial>> page(ErpMaterialQuery query) {
        return ApiResponse.success(service.pageMaterials(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("erp:base:material:list")
    public ApiResponse<ErpMaterial> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("erp:base:material:manage")
    public ApiResponse<Long> create(@Valid @RequestBody ErpMaterialSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("erp:base:material:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody ErpMaterialSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("erp:base:material:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
