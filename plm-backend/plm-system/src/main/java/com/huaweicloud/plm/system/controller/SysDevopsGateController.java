package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.DevopsGateQuery;
import com.huaweicloud.plm.system.dto.DevopsGateSaveRequest;
import com.huaweicloud.plm.system.entity.SysDevopsGate;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysDevopsGateService;
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
 * 质量与安全门禁接口（G1-N7 公共平台底座—DevSecOps WBS T012）：
 * 门禁记录、分页查询与删除。
 */
@RestController
@RequestMapping("/platform/devops/gates")
@RequiredArgsConstructor
public class SysDevopsGateController {

    private final SysDevopsGateService service;

    @GetMapping
    @RequirePermission("platform:devops:gate:list")
    public ApiResponse<PageResult<SysDevopsGate>> page(DevopsGateQuery query) {
        return ApiResponse.success(service.pageGates(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:devops:gate:list")
    public ApiResponse<SysDevopsGate> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:devops:gate:manage")
    public ApiResponse<Long> create(@Valid @RequestBody DevopsGateSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:devops:gate:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody DevopsGateSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:devops:gate:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
