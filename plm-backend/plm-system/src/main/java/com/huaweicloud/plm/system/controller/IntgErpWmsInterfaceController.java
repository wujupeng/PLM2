package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IntgErpWmsInterfaceQuery;
import com.huaweicloud.plm.system.dto.IntgErpWmsInterfaceSaveRequest;
import com.huaweicloud.plm.system.entity.IntgErpWmsInterface;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.IntgErpWmsInterfaceService;
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
 * 集成接口定义接口：ERP↔WMS 集成接口配置的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/intg/erp-wms/interfaces")
@RequiredArgsConstructor
public class IntgErpWmsInterfaceController {

    private final IntgErpWmsInterfaceService service;

    @GetMapping
    @RequirePermission("intg:erp-wms:interface:list")
    public ApiResponse<PageResult<IntgErpWmsInterface>> page(IntgErpWmsInterfaceQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("intg:erp-wms:interface:list")
    public ApiResponse<IntgErpWmsInterface> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("intg:erp-wms:interface:manage")
    public ApiResponse<Long> create(@Valid @RequestBody IntgErpWmsInterfaceSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("intg:erp-wms:interface:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody IntgErpWmsInterfaceSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("intg:erp-wms:interface:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
