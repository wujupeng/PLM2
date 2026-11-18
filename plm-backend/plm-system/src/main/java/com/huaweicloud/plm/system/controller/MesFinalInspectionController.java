package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MesFinalInspectionQuery;
import com.huaweicloud.plm.system.dto.MesFinalInspectionSaveRequest;
import com.huaweicloud.plm.system.entity.MesFinalInspection;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MesFinalInspectionService;
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
 * 终检接口：终检登记、分页查询与删除。
 */
@RestController
@RequestMapping("/mes/quality/finals")
@RequiredArgsConstructor
public class MesFinalInspectionController {

    private final MesFinalInspectionService service;

    @GetMapping
    @RequirePermission("mes:quality:final:list")
    public ApiResponse<PageResult<MesFinalInspection>> page(MesFinalInspectionQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("mes:quality:final:list")
    public ApiResponse<MesFinalInspection> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("mes:quality:final:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MesFinalInspectionSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("mes:quality:final:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody MesFinalInspectionSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("mes:quality:final:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
