package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.CodeParseRequest;
import com.huaweicloud.plm.system.dto.CodeParseResponse;
import com.huaweicloud.plm.system.dto.RelabelBatchRequest;
import com.huaweicloud.plm.system.dto.RelabelScanRequest;
import com.huaweicloud.plm.system.dto.RelabelScanResponse;
import com.huaweicloud.plm.system.dto.ScanLogQuery;
import com.huaweicloud.plm.system.entity.ScanLog;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.RelabelService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 扫描换标工作台接口（N5，DEV-056/057/061）。
 */
@RestController
@RequestMapping("/relabel")
@RequiredArgsConstructor
public class RelabelController {

    private final RelabelService relabelService;

    @PostMapping("/scan")
    @RequirePermission("relabel:scan")
    public ApiResponse<RelabelScanResponse> scan(@Valid @RequestBody RelabelScanRequest request) {
        return ApiResponse.success(relabelService.scan(request));
    }

    @PostMapping("/scan/batch")
    @RequirePermission("relabel:scan")
    public ApiResponse<List<RelabelScanResponse>> scanBatch(@RequestBody RelabelBatchRequest request) {
        return ApiResponse.success(relabelService.scanBatch(request));
    }

    @PostMapping("/parse")
    @RequirePermission("relabel:scan")
    public ApiResponse<CodeParseResponse> parseOnly(@RequestBody CodeParseRequest request) {
        return ApiResponse.success(relabelService.parseOnly(request));
    }

    @GetMapping("/logs")
    @RequirePermission("relabel:workbench")
    public ApiResponse<PageResult<ScanLog>> pageLogs(ScanLogQuery query) {
        return ApiResponse.success(relabelService.pageLogs(query));
    }

    @GetMapping("/logs/{scanLogId}")
    @RequirePermission("relabel:workbench")
    public ApiResponse<ScanLog> logDetail(@PathVariable Long scanLogId) {
        return ApiResponse.success(relabelService.logDetail(scanLogId));
    }
}
