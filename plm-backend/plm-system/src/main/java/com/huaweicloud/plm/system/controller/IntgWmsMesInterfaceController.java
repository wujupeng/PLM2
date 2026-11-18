package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IntgWmsMesInterfaceQuery;
import com.huaweicloud.plm.system.dto.IntgWmsMesInterfaceSaveRequest;
import com.huaweicloud.plm.system.entity.IntgWmsMesInterface;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.IntgWmsMesInterfaceService;
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
 * 集成接口定义接口：WMS↔MES 集成接口配置的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/intg/wms-mes/interfaces")
@RequiredArgsConstructor
public class IntgWmsMesInterfaceController {

    private final IntgWmsMesInterfaceService service;

    @GetMapping
    @RequirePermission("intg:wms-mes:interface:list")
    public ApiResponse<PageResult<IntgWmsMesInterface>> page(IntgWmsMesInterfaceQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("intg:wms-mes:interface:list")
    public ApiResponse<IntgWmsMesInterface> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("intg:wms-mes:interface:manage")
    public ApiResponse<Long> create(@Valid @RequestBody IntgWmsMesInterfaceSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("intg:wms-mes:interface:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody IntgWmsMesInterfaceSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("intg:wms-mes:interface:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
