package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.FileQuery;
import com.huaweicloud.plm.system.dto.SysFileAttachmentSaveRequest;
import com.huaweicloud.plm.system.entity.SysFileAttachment;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysFileAttachmentService;
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
 * 统一附件接口（G1-N3 公共平台底座—统一文件服务 WBS T011）：附件登记、隔离/放行与归档标记。
 */
@RestController
@RequestMapping("/platform/file/attachments")
@RequiredArgsConstructor
public class SysFileAttachmentController {

    private final SysFileAttachmentService service;

    @GetMapping
    @RequirePermission("platform:file:attachment:list")
    public ApiResponse<PageResult<SysFileAttachment>> page(FileQuery query) {
        return ApiResponse.success(service.pageAttachments(query));
    }

    @GetMapping("/stats")
    @RequirePermission("platform:file:attachment:list")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.success(service.stats());
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:file:attachment:list")
    public ApiResponse<SysFileAttachment> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:file:attachment:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SysFileAttachmentSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:file:attachment:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SysFileAttachmentSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    /** 隔离附件。 */
    @PostMapping("/{id}/quarantine")
    @RequirePermission("platform:file:attachment:manage")
    public ApiResponse<SysFileAttachment> quarantine(@PathVariable Long id) {
        return ApiResponse.success(service.quarantine(id));
    }

    /** 解除隔离。 */
    @PostMapping("/{id}/release")
    @RequirePermission("platform:file:attachment:manage")
    public ApiResponse<SysFileAttachment> release(@PathVariable Long id) {
        return ApiResponse.success(service.release(id));
    }

    /** 标记归档。 */
    @PostMapping("/{id}/archive")
    @RequirePermission("platform:file:attachment:manage")
    public ApiResponse<SysFileAttachment> archive(@PathVariable Long id) {
        return ApiResponse.success(service.markArchived(id));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:file:attachment:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
