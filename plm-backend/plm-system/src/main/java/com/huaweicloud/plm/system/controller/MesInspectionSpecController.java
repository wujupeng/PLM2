package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MesInspectionSpecQuery;
import com.huaweicloud.plm.system.dto.MesInspectionSpecSaveRequest;
import com.huaweicloud.plm.system.entity.MesInspectionSpec;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MesInspectionSpecService;
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
 * 检验规范接口：规范维护、分页查询与删除。
 */
@RestController
@RequestMapping("/mes/quality/specs")
@RequiredArgsConstructor
public class MesInspectionSpecController {

    private final MesInspectionSpecService service;

    @GetMapping
    @RequirePermission("mes:quality:spec:list")
    public ApiResponse<PageResult<MesInspectionSpec>> page(MesInspectionSpecQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("mes:quality:spec:list")
    public ApiResponse<MesInspectionSpec> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("mes:quality:spec:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MesInspectionSpecSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("mes:quality:spec:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody MesInspectionSpecSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("mes:quality:spec:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
