package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.AuditLogQuery;
import com.huaweicloud.plm.system.entity.SysAuditLog;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/system/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    @RequirePermission("system:audit:list")
    public ApiResponse<PageResult<SysAuditLog>> page(AuditLogQuery query) {
        return ApiResponse.success(auditLogService.page(query));
    }
}
