package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.FileQuery;
import com.huaweicloud.plm.system.dto.SysFileScanRecordSaveRequest;
import com.huaweicloud.plm.system.entity.SysFileScanRecord;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysFileScanRecordService;
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
 * 病毒扫描记录接口（G1-N3 公共平台底座—统一文件服务 WBS T011）：扫描记录登记与查询。
 */
@RestController
@RequestMapping("/platform/file/scan-records")
@RequiredArgsConstructor
public class SysFileScanRecordController {

    private final SysFileScanRecordService service;

    @GetMapping
    @RequirePermission("platform:file:scan:list")
    public ApiResponse<PageResult<SysFileScanRecord>> page(FileQuery query) {
        return ApiResponse.success(service.pageRecords(query));
    }

    @GetMapping("/stats")
    @RequirePermission("platform:file:scan:list")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.success(service.stats());
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:file:scan:list")
    public ApiResponse<SysFileScanRecord> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:file:scan:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SysFileScanRecordSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:file:scan:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SysFileScanRecordSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:file:scan:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
