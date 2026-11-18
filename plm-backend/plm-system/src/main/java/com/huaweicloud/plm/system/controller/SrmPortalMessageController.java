package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.SrmPortalMessageQuery;
import com.huaweicloud.plm.system.dto.SrmPortalMessageSaveRequest;
import com.huaweicloud.plm.system.entity.SrmPortalMessage;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SrmPortalMessageService;
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
 * 门户消息接口（对应门户消息）：
 * 门户消息登记、分页查询与删除。
 */
@RestController
@RequestMapping("/srm/portal/messages")
@RequiredArgsConstructor
public class SrmPortalMessageController {

    private final SrmPortalMessageService service;

    @GetMapping
    @RequirePermission("srm:portal:message:list")
    public ApiResponse<PageResult<SrmPortalMessage>> page(SrmPortalMessageQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("srm:portal:message:list")
    public ApiResponse<SrmPortalMessage> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("srm:portal:message:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SrmPortalMessageSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("srm:portal:message:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SrmPortalMessageSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("srm:portal:message:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
