package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MobileConfigQuery;
import com.huaweicloud.plm.system.dto.MobileConfigSaveRequest;
import com.huaweicloud.plm.system.dto.MobileWorkbenchResponse;
import com.huaweicloud.plm.system.entity.OaMobileConfig;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaMobileConfigService;
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
 * 移动端配置与工作台接口（OA-DEV-061）：移动端菜单/策略配置维护，以及移动工作台汇总。
 */
@RestController
@RequestMapping("/oa/mobile")
@RequiredArgsConstructor
public class OaMobileConfigController {

    private final OaMobileConfigService mobileConfigService;

    @GetMapping("/configs")
    @RequirePermission("oa:mobile:manage")
    public ApiResponse<PageResult<OaMobileConfig>> page(MobileConfigQuery query) {
        return ApiResponse.success(mobileConfigService.page(query));
    }

    @PostMapping("/configs")
    @RequirePermission("oa:mobile:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MobileConfigSaveRequest request) {
        return ApiResponse.success(mobileConfigService.create(request));
    }

    @PutMapping("/configs/{id}")
    @RequirePermission("oa:mobile:manage")
    public ApiResponse<Void> update(@PathVariable Long id, @Valid @RequestBody MobileConfigSaveRequest request) {
        mobileConfigService.update(id, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/configs/{id}")
    @RequirePermission("oa:mobile:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        mobileConfigService.delete(id);
        return ApiResponse.success();
    }

    /** 移动端工作台：返回菜单、策略与待办/未读汇总。 */
    @GetMapping("/workbench")
    @RequirePermission("oa:mobile:view")
    public ApiResponse<MobileWorkbenchResponse> workbench() {
        return ApiResponse.success(mobileConfigService.workbench());
    }
}
