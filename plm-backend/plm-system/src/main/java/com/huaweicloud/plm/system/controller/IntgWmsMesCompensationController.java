package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IntgWmsMesCompensationQuery;
import com.huaweicloud.plm.system.dto.IntgWmsMesCompensationSaveRequest;
import com.huaweicloud.plm.system.entity.IntgWmsMesCompensation;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.IntgWmsMesCompensationService;
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
 * WMS↔MES 异常补偿接口：WMS↔MES 集成异常补偿的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/intg/wms-mes/compensations")
@RequiredArgsConstructor
public class IntgWmsMesCompensationController {

    private final IntgWmsMesCompensationService service;

    @GetMapping
    @RequirePermission("intg:wms-mes:compensation:list")
    public ApiResponse<PageResult<IntgWmsMesCompensation>> page(IntgWmsMesCompensationQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("intg:wms-mes:compensation:list")
    public ApiResponse<IntgWmsMesCompensation> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("intg:wms-mes:compensation:manage")
    public ApiResponse<Long> create(@Valid @RequestBody IntgWmsMesCompensationSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("intg:wms-mes:compensation:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody IntgWmsMesCompensationSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("intg:wms-mes:compensation:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
