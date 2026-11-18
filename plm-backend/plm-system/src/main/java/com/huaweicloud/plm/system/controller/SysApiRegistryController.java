package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IntegrationQuery;
import com.huaweicloud.plm.system.dto.SysApiRegistrySaveRequest;
import com.huaweicloud.plm.system.entity.SysApiRegistry;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysApiRegistryService;
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

import java.util.Map;

/**
 * 接口注册中心接口（G1-N1 集成平台 T009）：接口契约登记、发布/废弃/下线。
 */
@RestController
@RequestMapping("/platform/integration/api-registries")
@RequiredArgsConstructor
public class SysApiRegistryController {

    private final SysApiRegistryService service;

    @GetMapping
    @RequirePermission("platform:integration:api:list")
    public ApiResponse<PageResult<SysApiRegistry>> page(IntegrationQuery query) {
        return ApiResponse.success(service.pageApis(query));
    }

    @GetMapping("/stats")
    @RequirePermission("platform:integration:api:list")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.success(service.stats());
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:integration:api:list")
    public ApiResponse<SysApiRegistry> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:integration:api:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SysApiRegistrySaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:integration:api:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SysApiRegistrySaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    /** 发布接口。 */
    @PostMapping("/{id}/publish")
    @RequirePermission("platform:integration:api:manage")
    public ApiResponse<SysApiRegistry> publish(@PathVariable Long id) {
        return ApiResponse.success(service.publish(id));
    }

    /** 废弃接口。 */
    @PostMapping("/{id}/deprecate")
    @RequirePermission("platform:integration:api:manage")
    public ApiResponse<SysApiRegistry> deprecate(@PathVariable Long id) {
        return ApiResponse.success(service.deprecate(id));
    }

    /** 下线接口。 */
    @PostMapping("/{id}/offline")
    @RequirePermission("platform:integration:api:manage")
    public ApiResponse<SysApiRegistry> offline(@PathVariable Long id) {
        return ApiResponse.success(service.offline(id));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:integration:api:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
