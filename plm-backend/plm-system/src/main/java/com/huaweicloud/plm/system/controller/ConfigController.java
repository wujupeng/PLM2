package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ConfigQuery;
import com.huaweicloud.plm.system.dto.ConfigSaveRequest;
import com.huaweicloud.plm.system.entity.SysConfig;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ConfigService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * 后台可配置项接口，支撑任务书中“未明确规则优先做成可配置项”的要求。
 */
@RestController
@RequestMapping("/system/configs")
@RequiredArgsConstructor
public class ConfigController {

    private final ConfigService configService;

    @GetMapping
    @RequirePermission("system:config:list")
    public ApiResponse<PageResult<SysConfig>> page(ConfigQuery query) {
        return ApiResponse.success(configService.page(query));
    }

    @GetMapping("/by-category")
    @RequirePermission("system:config:list")
    public ApiResponse<List<SysConfig>> listByCategory(@RequestParam(required = false) String category) {
        return ApiResponse.success(configService.listByCategory(category));
    }

    @PostMapping
    @RequirePermission("system:config:create")
    public ApiResponse<Long> create(@Valid @RequestBody ConfigSaveRequest request) {
        return ApiResponse.success(configService.create(request));
    }

    @PutMapping("/{configId}")
    @RequirePermission("system:config:update")
    public ApiResponse<Void> update(@PathVariable Long configId, @Valid @RequestBody ConfigSaveRequest request) {
        configService.update(configId, request);
        return ApiResponse.success();
    }

    @PutMapping("/{configId}/value")
    @RequirePermission("system:config:update")
    public ApiResponse<Void> updateValue(@PathVariable Long configId, @RequestBody Map<String, String> body) {
        configService.updateValue(configId, body.get("configValue"));
        return ApiResponse.success();
    }

    @DeleteMapping("/{configId}")
    @RequirePermission("system:config:delete")
    public ApiResponse<Void> delete(@PathVariable Long configId) {
        configService.delete(configId);
        return ApiResponse.success();
    }
}
