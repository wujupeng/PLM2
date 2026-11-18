package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.SrmPortalAttachmentQuery;
import com.huaweicloud.plm.system.dto.SrmPortalAttachmentSaveRequest;
import com.huaweicloud.plm.system.entity.SrmPortalAttachment;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SrmPortalAttachmentService;
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
 * 门户附件接口（对应门户附件）：
 * 附件登记、分页查询与删除。
 */
@RestController
@RequestMapping("/srm/portal/attachments")
@RequiredArgsConstructor
public class SrmPortalAttachmentController {

    private final SrmPortalAttachmentService service;

    @GetMapping
    @RequirePermission("srm:portal:attachment:list")
    public ApiResponse<PageResult<SrmPortalAttachment>> page(SrmPortalAttachmentQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("srm:portal:attachment:list")
    public ApiResponse<SrmPortalAttachment> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("srm:portal:attachment:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SrmPortalAttachmentSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("srm:portal:attachment:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SrmPortalAttachmentSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("srm:portal:attachment:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
