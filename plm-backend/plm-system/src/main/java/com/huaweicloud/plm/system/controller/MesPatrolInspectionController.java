package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MesPatrolInspectionQuery;
import com.huaweicloud.plm.system.dto.MesPatrolInspectionSaveRequest;
import com.huaweicloud.plm.system.entity.MesPatrolInspection;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MesPatrolInspectionService;
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
 * 巡检接口：巡检登记、分页查询与删除。
 */
@RestController
@RequestMapping("/mes/quality/patrols")
@RequiredArgsConstructor
public class MesPatrolInspectionController {

    private final MesPatrolInspectionService service;

    @GetMapping
    @RequirePermission("mes:quality:patrol:list")
    public ApiResponse<PageResult<MesPatrolInspection>> page(MesPatrolInspectionQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("mes:quality:patrol:list")
    public ApiResponse<MesPatrolInspection> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("mes:quality:patrol:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MesPatrolInspectionSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("mes:quality:patrol:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody MesPatrolInspectionSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("mes:quality:patrol:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
