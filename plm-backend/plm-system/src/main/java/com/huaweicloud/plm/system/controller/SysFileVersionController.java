package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.FileQuery;
import com.huaweicloud.plm.system.dto.SysFileVersionSaveRequest;
import com.huaweicloud.plm.system.entity.SysFileVersion;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysFileVersionService;
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
 * 文件版本接口（G1-N3 公共平台底座—统一文件服务 WBS T011）：版本登记与当前版本切换。
 */
@RestController
@RequestMapping("/platform/file/versions")
@RequiredArgsConstructor
public class SysFileVersionController {

    private final SysFileVersionService service;

    @GetMapping
    @RequirePermission("platform:file:version:list")
    public ApiResponse<PageResult<SysFileVersion>> page(FileQuery query) {
        return ApiResponse.success(service.pageVersions(query));
    }

    @GetMapping("/stats")
    @RequirePermission("platform:file:version:list")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.success(service.stats());
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:file:version:list")
    public ApiResponse<SysFileVersion> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:file:version:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SysFileVersionSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:file:version:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SysFileVersionSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    /** 置为当前版本。 */
    @PostMapping("/{id}/current")
    @RequirePermission("platform:file:version:manage")
    public ApiResponse<SysFileVersion> setCurrent(@PathVariable Long id) {
        return ApiResponse.success(service.setCurrent(id));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:file:version:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
