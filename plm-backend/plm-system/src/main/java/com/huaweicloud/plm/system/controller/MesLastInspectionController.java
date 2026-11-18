package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MesLastInspectionQuery;
import com.huaweicloud.plm.system.dto.MesLastInspectionSaveRequest;
import com.huaweicloud.plm.system.entity.MesLastInspection;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MesLastInspectionService;
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
 * 末件检验接口：末件检验登记、分页查询与删除。
 */
@RestController
@RequestMapping("/mes/quality/lasts")
@RequiredArgsConstructor
public class MesLastInspectionController {

    private final MesLastInspectionService service;

    @GetMapping
    @RequirePermission("mes:quality:last:list")
    public ApiResponse<PageResult<MesLastInspection>> page(MesLastInspectionQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("mes:quality:last:list")
    public ApiResponse<MesLastInspection> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("mes:quality:last:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MesLastInspectionSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("mes:quality:last:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody MesLastInspectionSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("mes:quality:last:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
