package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IntgPlmErpInterfaceQuery;
import com.huaweicloud.plm.system.dto.IntgPlmErpInterfaceSaveRequest;
import com.huaweicloud.plm.system.entity.IntgPlmErpInterface;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.IntgPlmErpInterfaceService;
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
 * 集成接口定义接口：PLM→ERP 集成接口配置的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/intg/plm-erp/interfaces")
@RequiredArgsConstructor
public class IntgPlmErpInterfaceController {

    private final IntgPlmErpInterfaceService service;

    @GetMapping
    @RequirePermission("intg:plm-erp:interface:list")
    public ApiResponse<PageResult<IntgPlmErpInterface>> page(IntgPlmErpInterfaceQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("intg:plm-erp:interface:list")
    public ApiResponse<IntgPlmErpInterface> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("intg:plm-erp:interface:manage")
    public ApiResponse<Long> create(@Valid @RequestBody IntgPlmErpInterfaceSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("intg:plm-erp:interface:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody IntgPlmErpInterfaceSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("intg:plm-erp:interface:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
