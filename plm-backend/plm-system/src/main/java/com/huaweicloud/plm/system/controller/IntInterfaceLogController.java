package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IntInterfaceLogQuery;
import com.huaweicloud.plm.system.dto.IntInterfaceLogSaveRequest;
import com.huaweicloud.plm.system.entity.IntInterfaceLog;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.IntInterfaceLogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** 接口调用日志接口（N9，DEV-096）。 */
@RestController
@RequestMapping("/int/logs")
@RequiredArgsConstructor
public class IntInterfaceLogController {

    private final IntInterfaceLogService intInterfaceLogService;

    @GetMapping
    @RequirePermission("int:log:list")
    public ApiResponse<PageResult<IntInterfaceLog>> page(IntInterfaceLogQuery query) {
        return ApiResponse.success(intInterfaceLogService.page(query));
    }

    @GetMapping("/{logNo}")
    @RequirePermission("int:log:list")
    public ApiResponse<IntInterfaceLog> detail(@PathVariable String logNo) {
        return ApiResponse.success(intInterfaceLogService.require(logNo));
    }

    @PostMapping("/record")
    @RequirePermission("int:log:list")
    public ApiResponse<IntInterfaceLog> record(@Valid @RequestBody IntInterfaceLogSaveRequest request) {
        return ApiResponse.success(intInterfaceLogService.record(request));
    }

    @PostMapping("/{logNo}/retry")
    @RequirePermission("int:log:retry")
    public ApiResponse<IntInterfaceLog> retry(@PathVariable String logNo) {
        return ApiResponse.success(intInterfaceLogService.retry(logNo));
    }

    @PostMapping("/{logNo}/compensate")
    @RequirePermission("int:log:compensate")
    public ApiResponse<IntInterfaceLog> compensate(@PathVariable String logNo) {
        return ApiResponse.success(intInterfaceLogService.compensate(logNo));
    }
}
