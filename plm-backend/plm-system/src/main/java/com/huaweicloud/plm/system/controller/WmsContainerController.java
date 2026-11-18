package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.WmsContainerQuery;
import com.huaweicloud.plm.system.dto.WmsContainerSaveRequest;
import com.huaweicloud.plm.system.entity.WmsContainer;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.WmsContainerService;
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
 * 容器管理接口（对应容器管理）：
 * 容器登记、分页查询与删除。
 */
@RestController
@RequestMapping("/wms/base/containers")
@RequiredArgsConstructor
public class WmsContainerController {

    private final WmsContainerService service;

    @GetMapping
    @RequirePermission("wms:base:container:list")
    public ApiResponse<PageResult<WmsContainer>> page(WmsContainerQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("wms:base:container:list")
    public ApiResponse<WmsContainer> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("wms:base:container:manage")
    public ApiResponse<Long> create(@Valid @RequestBody WmsContainerSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("wms:base:container:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody WmsContainerSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("wms:base:container:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
