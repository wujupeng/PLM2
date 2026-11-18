package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.OaGoliveQuery;
import com.huaweicloud.plm.system.dto.OaLegacyArchiveSaveRequest;
import com.huaweicloud.plm.system.entity.OaLegacyArchive;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaLegacyArchiveService;
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
 * 现有OA只读封存接口（OA-DEV-119）：封存类型、封存范围、快照、保留策略与查询入口。
 */
@RestController
@RequestMapping("/oa/golive/legacy-archives")
@RequiredArgsConstructor
public class OaLegacyArchiveController {

    private final OaLegacyArchiveService service;

    @GetMapping
    @RequirePermission("oa:golive:archive:list")
    public ApiResponse<PageResult<OaLegacyArchive>> page(OaGoliveQuery query) {
        return ApiResponse.success(service.pageArchives(query));
    }

    @GetMapping("/stats")
    @RequirePermission("oa:golive:archive:list")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.success(service.stats());
    }

    @GetMapping("/{id}")
    @RequirePermission("oa:golive:archive:list")
    public ApiResponse<OaLegacyArchive> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("oa:golive:archive:manage")
    public ApiResponse<Long> create(@Valid @RequestBody OaLegacyArchiveSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("oa:golive:archive:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody OaLegacyArchiveSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    /** 执行封存。 */
    @PostMapping("/{id}/archive")
    @RequirePermission("oa:golive:archive:manage")
    public ApiResponse<OaLegacyArchive> archive(@PathVariable Long id) {
        return ApiResponse.success(service.archive(id));
    }

    /** 校验备份。 */
    @PostMapping("/{id}/verify")
    @RequirePermission("oa:golive:archive:manage")
    public ApiResponse<OaLegacyArchive> verify(@PathVariable Long id) {
        return ApiResponse.success(service.verify(id));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("oa:golive:archive:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
