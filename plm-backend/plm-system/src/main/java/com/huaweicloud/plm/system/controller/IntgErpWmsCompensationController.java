package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IntgErpWmsCompensationQuery;
import com.huaweicloud.plm.system.dto.IntgErpWmsCompensationSaveRequest;
import com.huaweicloud.plm.system.entity.IntgErpWmsCompensation;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.IntgErpWmsCompensationService;
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
 * ERP↔WMS 异常补偿接口：ERP↔WMS 集成异常补偿的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/intg/erp-wms/compensations")
@RequiredArgsConstructor
public class IntgErpWmsCompensationController {

    private final IntgErpWmsCompensationService service;

    @GetMapping
    @RequirePermission("intg:erp-wms:compensation:list")
    public ApiResponse<PageResult<IntgErpWmsCompensation>> page(IntgErpWmsCompensationQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("intg:erp-wms:compensation:list")
    public ApiResponse<IntgErpWmsCompensation> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("intg:erp-wms:compensation:manage")
    public ApiResponse<Long> create(@Valid @RequestBody IntgErpWmsCompensationSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("intg:erp-wms:compensation:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody IntgErpWmsCompensationSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("intg:erp-wms:compensation:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
