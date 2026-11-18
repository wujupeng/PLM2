package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MesIncomingInspectionQuery;
import com.huaweicloud.plm.system.dto.MesIncomingInspectionSaveRequest;
import com.huaweicloud.plm.system.entity.MesIncomingInspection;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MesIncomingInspectionService;
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
 * 来料检验接口：来料检验登记、分页查询与删除。
 */
@RestController
@RequestMapping("/mes/quality/incomings")
@RequiredArgsConstructor
public class MesIncomingInspectionController {

    private final MesIncomingInspectionService service;

    @GetMapping
    @RequirePermission("mes:quality:incoming:list")
    public ApiResponse<PageResult<MesIncomingInspection>> page(MesIncomingInspectionQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("mes:quality:incoming:list")
    public ApiResponse<MesIncomingInspection> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("mes:quality:incoming:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MesIncomingInspectionSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("mes:quality:incoming:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody MesIncomingInspectionSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("mes:quality:incoming:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
