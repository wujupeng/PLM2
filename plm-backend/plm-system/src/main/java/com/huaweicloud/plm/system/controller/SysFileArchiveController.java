package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.FileQuery;
import com.huaweicloud.plm.system.dto.SysFileArchiveSaveRequest;
import com.huaweicloud.plm.system.entity.SysFileArchive;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysFileArchiveService;
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
 * 文件归档接口（G1-N3 公共平台底座—统一文件服务 WBS T011）：归档登记、归档/恢复与过期标记。
 */
@RestController
@RequestMapping("/platform/file/archives")
@RequiredArgsConstructor
public class SysFileArchiveController {

    private final SysFileArchiveService service;

    @GetMapping
    @RequirePermission("platform:file:archive:list")
    public ApiResponse<PageResult<SysFileArchive>> page(FileQuery query) {
        return ApiResponse.success(service.pageArchives(query));
    }

    @GetMapping("/stats")
    @RequirePermission("platform:file:archive:list")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.success(service.stats());
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:file:archive:list")
    public ApiResponse<SysFileArchive> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:file:archive:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SysFileArchiveSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:file:archive:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SysFileArchiveSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    /** 执行归档。 */
    @PostMapping("/{id}/archive")
    @RequirePermission("platform:file:archive:manage")
    public ApiResponse<SysFileArchive> archive(@PathVariable Long id) {
        return ApiResponse.success(service.archive(id));
    }

    /** 申请恢复。 */
    @PostMapping("/{id}/restore")
    @RequirePermission("platform:file:archive:manage")
    public ApiResponse<SysFileArchive> restore(@PathVariable Long id) {
        return ApiResponse.success(service.restore(id));
    }

    /** 标记过期。 */
    @PostMapping("/{id}/expire")
    @RequirePermission("platform:file:archive:manage")
    public ApiResponse<SysFileArchive> expire(@PathVariable Long id) {
        return ApiResponse.success(service.expire(id));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:file:archive:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
