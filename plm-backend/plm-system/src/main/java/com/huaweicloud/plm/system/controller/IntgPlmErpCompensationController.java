package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IntgPlmErpCompensationQuery;
import com.huaweicloud.plm.system.dto.IntgPlmErpCompensationSaveRequest;
import com.huaweicloud.plm.system.entity.IntgPlmErpCompensation;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.IntgPlmErpCompensationService;
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
 * ERP 异常补偿接口：PLM→ERP 集成异常补偿的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/intg/plm-erp/compensations")
@RequiredArgsConstructor
public class IntgPlmErpCompensationController {

    private final IntgPlmErpCompensationService service;

    @GetMapping
    @RequirePermission("intg:plm-erp:compensation:list")
    public ApiResponse<PageResult<IntgPlmErpCompensation>> page(IntgPlmErpCompensationQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("intg:plm-erp:compensation:list")
    public ApiResponse<IntgPlmErpCompensation> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("intg:plm-erp:compensation:manage")
    public ApiResponse<Long> create(@Valid @RequestBody IntgPlmErpCompensationSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("intg:plm-erp:compensation:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody IntgPlmErpCompensationSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("intg:plm-erp:compensation:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
