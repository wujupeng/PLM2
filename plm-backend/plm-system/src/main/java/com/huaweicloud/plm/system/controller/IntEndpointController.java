package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IntEndpointQuery;
import com.huaweicloud.plm.system.dto.IntEndpointSaveRequest;
import com.huaweicloud.plm.system.entity.IntEndpoint;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.IntEndpointService;
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

import java.util.List;

/** 接口配置接口（N9，DEV-096）。 */
@RestController
@RequestMapping("/int/endpoints")
@RequiredArgsConstructor
public class IntEndpointController {

    private final IntEndpointService intEndpointService;

    @GetMapping
    @RequirePermission("int:endpoint:list")
    public ApiResponse<PageResult<IntEndpoint>> page(IntEndpointQuery query) {
        return ApiResponse.success(intEndpointService.page(query));
    }

    @GetMapping("/enabled")
    @RequirePermission("int:endpoint:list")
    public ApiResponse<List<IntEndpoint>> listEnabled() {
        return ApiResponse.success(intEndpointService.listEnabled());
    }

    @GetMapping("/{endpointCode}")
    @RequirePermission("int:endpoint:list")
    public ApiResponse<IntEndpoint> detail(@PathVariable String endpointCode) {
        return ApiResponse.success(intEndpointService.require(endpointCode));
    }

    @PostMapping
    @RequirePermission("int:endpoint:save")
    public ApiResponse<String> create(@Valid @RequestBody IntEndpointSaveRequest request) {
        return ApiResponse.success(intEndpointService.create(request));
    }

    @PutMapping("/{endpointCode}")
    @RequirePermission("int:endpoint:save")
    public ApiResponse<Void> update(@PathVariable String endpointCode,
                                    @Valid @RequestBody IntEndpointSaveRequest request) {
        intEndpointService.update(endpointCode, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{endpointCode}")
    @RequirePermission("int:endpoint:delete")
    public ApiResponse<Void> delete(@PathVariable String endpointCode) {
        intEndpointService.delete(endpointCode);
        return ApiResponse.success();
    }
}
