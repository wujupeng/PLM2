package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MobileScanLogQuery;
import com.huaweicloud.plm.system.dto.MobileScanLogSaveRequest;
import com.huaweicloud.plm.system.dto.MobileScanRequest;
import com.huaweicloud.plm.system.dto.MobileScanResult;
import com.huaweicloud.plm.system.entity.SysMobileScanLog;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysMobileScanLogService;
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
 * 扫码操作日志接口（G1-N6 公共平台底座—通用能力 WBS T106 移动端与PDA）：
 * 扫码日志查询/维护与扫码记录入口。
 */
@RestController
@RequestMapping("/platform/mobile/scan-logs")
@RequiredArgsConstructor
public class SysMobileScanLogController {

    private final SysMobileScanLogService service;

    @GetMapping
    @RequirePermission("platform:mobile:scanlog:list")
    public ApiResponse<PageResult<SysMobileScanLog>> page(MobileScanLogQuery query) {
        return ApiResponse.success(service.pageScanLogs(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:mobile:scanlog:list")
    public ApiResponse<SysMobileScanLog> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:mobile:scanlog:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MobileScanLogSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:mobile:scanlog:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody MobileScanLogSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    /** 记录扫码：先做标签校验再落日志，校验失败时自动入队移动异常。 */
    @PostMapping("/scan")
    @RequirePermission("platform:mobile:scanlog:list")
    public ApiResponse<MobileScanResult> scan(@Valid @RequestBody MobileScanRequest request) {
        return ApiResponse.success(service.recordScan(request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:mobile:scanlog:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
