package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.BizMigrationAttachmentSaveRequest;
import com.huaweicloud.plm.system.dto.OaMigrationQuery;
import com.huaweicloud.plm.system.entity.OaMigrationAttachmentTask;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaMigrationAttachmentService;
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

import java.util.Map;

/**
 * 附件迁移接口（OA-DEV-099）：分片续传、哈希校验与失败重试。
 */
@RestController
@RequestMapping("/oa/migration/attachments")
@RequiredArgsConstructor
public class OaMigrationAttachmentController {

    private final OaMigrationAttachmentService attachmentService;

    @GetMapping
    @RequirePermission("oa:migration:attachment:list")
    public ApiResponse<PageResult<OaMigrationAttachmentTask>> page(OaMigrationQuery query) {
        return ApiResponse.success(attachmentService.page(query));
    }

    @GetMapping("/stats")
    @RequirePermission("oa:migration:attachment:list")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.success(attachmentService.stats());
    }

    @GetMapping("/{id}")
    @RequirePermission("oa:migration:attachment:list")
    public ApiResponse<OaMigrationAttachmentTask> detail(@PathVariable Long id) {
        return ApiResponse.success(attachmentService.detail(id));
    }

    @PostMapping
    @RequirePermission("oa:migration:attachment:manage")
    public ApiResponse<Long> create(@Valid @RequestBody BizMigrationAttachmentSaveRequest request) {
        return ApiResponse.success(attachmentService.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("oa:migration:attachment:manage")
    public ApiResponse<Long> update(@PathVariable Long id,
                                    @Valid @RequestBody BizMigrationAttachmentSaveRequest request) {
        return ApiResponse.success(attachmentService.save(id, request));
    }

    /** 断点续传：推进已完成分片。 */
    @PostMapping("/{id}/advance-chunk")
    @RequirePermission("oa:migration:attachment:manage")
    public ApiResponse<OaMigrationAttachmentTask> advanceChunk(@PathVariable Long id) {
        return ApiResponse.success(attachmentService.advanceChunk(id));
    }

    /** 哈希校验：目标哈希与源哈希一致则任务成功。 */
    @PostMapping("/{id}/verify")
    @RequirePermission("oa:migration:attachment:manage")
    public ApiResponse<OaMigrationAttachmentTask> verify(@PathVariable Long id,
                                                        @RequestParam(required = false) String targetHash) {
        return ApiResponse.success(attachmentService.verify(id, targetHash));
    }

    /** 失败重试：超过最大重试次数返回 409。 */
    @PostMapping("/{id}/retry")
    @RequirePermission("oa:migration:attachment:manage")
    public ApiResponse<OaMigrationAttachmentTask> retry(@PathVariable Long id) {
        return ApiResponse.success(attachmentService.retry(id));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("oa:migration:attachment:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        attachmentService.delete(id);
        return ApiResponse.success();
    }
}
