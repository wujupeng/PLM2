package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IntBackupRecordQuery;
import com.huaweicloud.plm.system.dto.IntBackupRecordSaveRequest;
import com.huaweicloud.plm.system.dto.IntSecurityIssueFixRequest;
import com.huaweicloud.plm.system.dto.IntSecurityIssueQuery;
import com.huaweicloud.plm.system.dto.IntSecurityIssueSaveRequest;
import com.huaweicloud.plm.system.entity.IntBackupRecord;
import com.huaweicloud.plm.system.entity.IntSecurityIssue;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.IntBackupRecordService;
import com.huaweicloud.plm.system.service.IntSecurityIssueService;
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
 * 安全与备份接口（N9，DEV-102 / DEV-103）。
 */
@RestController
@RequestMapping("/int")
@RequiredArgsConstructor
public class IntSecurityController {

    private final IntSecurityIssueService intSecurityIssueService;
    private final IntBackupRecordService intBackupRecordService;

    // ==================== 安全问题 ====================

    /** 分页查询安全问题。 */
    @GetMapping("/security-issues")
    @RequirePermission("int:security:list")
    public ApiResponse<PageResult<IntSecurityIssue>> pageSecurityIssues(IntSecurityIssueQuery query) {
        return ApiResponse.success(intSecurityIssueService.page(query));
    }

    /** 查询安全问题详情。 */
    @GetMapping("/security-issues/{issueNo}")
    @RequirePermission("int:security:list")
    public ApiResponse<IntSecurityIssue> securityIssueDetail(@PathVariable String issueNo) {
        return ApiResponse.success(intSecurityIssueService.require(issueNo));
    }

    /** 新增安全问题。 */
    @PostMapping("/security-issues")
    @RequirePermission("int:security:save")
    public ApiResponse<String> createSecurityIssue(@Valid @RequestBody IntSecurityIssueSaveRequest request) {
        return ApiResponse.success(intSecurityIssueService.create(request));
    }

    /** 修改安全问题。 */
    @PutMapping("/security-issues/{issueNo}")
    @RequirePermission("int:security:save")
    public ApiResponse<Void> updateSecurityIssue(@PathVariable String issueNo,
                                                 @Valid @RequestBody IntSecurityIssueSaveRequest request) {
        intSecurityIssueService.update(issueNo, request);
        return ApiResponse.success();
    }

    /** 删除安全问题。 */
    @DeleteMapping("/security-issues/{issueNo}")
    @RequirePermission("int:security:save")
    public ApiResponse<Void> deleteSecurityIssue(@PathVariable String issueNo) {
        intSecurityIssueService.delete(issueNo);
        return ApiResponse.success();
    }

    /** 整改安全问题。 */
    @PostMapping("/security-issues/{issueNo}/fix")
    @RequirePermission("int:security:fix")
    public ApiResponse<IntSecurityIssue> fixSecurityIssue(@PathVariable String issueNo,
                                                          @RequestBody(required = false) IntSecurityIssueFixRequest request) {
        return ApiResponse.success(intSecurityIssueService.fix(issueNo,
                request == null ? new IntSecurityIssueFixRequest() : request));
    }

    /** 验证安全问题。 */
    @PostMapping("/security-issues/{issueNo}/verify")
    @RequirePermission("int:security:fix")
    public ApiResponse<IntSecurityIssue> verifySecurityIssue(@PathVariable String issueNo) {
        return ApiResponse.success(intSecurityIssueService.verify(issueNo));
    }

    // ==================== 备份恢复记录 ====================

    /** 分页查询备份恢复记录。 */
    @GetMapping("/backups")
    @RequirePermission("int:backup:list")
    public ApiResponse<PageResult<IntBackupRecord>> pageBackups(IntBackupRecordQuery query) {
        return ApiResponse.success(intBackupRecordService.page(query));
    }

    /** 查询备份恢复记录详情。 */
    @GetMapping("/backups/{recordNo}")
    @RequirePermission("int:backup:list")
    public ApiResponse<IntBackupRecord> backupDetail(@PathVariable String recordNo) {
        return ApiResponse.success(intBackupRecordService.require(recordNo));
    }

    /** 新增备份恢复记录。 */
    @PostMapping("/backups")
    @RequirePermission("int:backup:save")
    public ApiResponse<String> createBackup(@Valid @RequestBody IntBackupRecordSaveRequest request) {
        return ApiResponse.success(intBackupRecordService.create(request));
    }

    /** 修改备份恢复记录。 */
    @PutMapping("/backups/{recordNo}")
    @RequirePermission("int:backup:save")
    public ApiResponse<Void> updateBackup(@PathVariable String recordNo,
                                          @Valid @RequestBody IntBackupRecordSaveRequest request) {
        intBackupRecordService.update(recordNo, request);
        return ApiResponse.success();
    }

    /** 删除备份恢复记录。 */
    @DeleteMapping("/backups/{recordNo}")
    @RequirePermission("int:backup:save")
    public ApiResponse<Void> deleteBackup(@PathVariable String recordNo) {
        intBackupRecordService.delete(recordNo);
        return ApiResponse.success();
    }

    /** 验证备份恢复记录。 */
    @PostMapping("/backups/{recordNo}/verify")
    @RequirePermission("int:backup:verify")
    public ApiResponse<IntBackupRecord> verifyBackup(@PathVariable String recordNo) {
        return ApiResponse.success(intBackupRecordService.verify(recordNo));
    }
}
