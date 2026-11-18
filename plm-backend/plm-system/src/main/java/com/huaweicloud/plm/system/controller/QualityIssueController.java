package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.QualityIssueActionSaveRequest;
import com.huaweicloud.plm.system.dto.QualityIssueActionVerifyRequest;
import com.huaweicloud.plm.system.dto.QualityIssueCloseRequest;
import com.huaweicloud.plm.system.dto.QualityIssueDetailResponse;
import com.huaweicloud.plm.system.dto.QualityIssueEcrResult;
import com.huaweicloud.plm.system.dto.QualityIssueQuery;
import com.huaweicloud.plm.system.dto.QualityIssueSaveRequest;
import com.huaweicloud.plm.system.dto.QualityIssueToEcrRequest;
import com.huaweicloud.plm.system.dto.QualityIssueUpdateRequest;
import com.huaweicloud.plm.system.entity.QualityIssue;
import com.huaweicloud.plm.system.entity.QualityIssueAction;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.QualityIssueService;
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

import java.util.List;

/**
 * 质量问题单接口（DEV-049 / DEV-050）。
 */
@RestController
@RequestMapping("/quality/issues")
@RequiredArgsConstructor
public class QualityIssueController {

    private final QualityIssueService qualityIssueService;

    @GetMapping
    @RequirePermission("quality:list")
    public ApiResponse<PageResult<QualityIssue>> page(QualityIssueQuery query) {
        return ApiResponse.success(qualityIssueService.page(query));
    }

    @GetMapping("/{issueId}")
    @RequirePermission("quality:list")
    public ApiResponse<QualityIssueDetailResponse> detail(@PathVariable Long issueId) {
        return ApiResponse.success(qualityIssueService.detail(issueId));
    }

    @PostMapping
    @RequirePermission("quality:create")
    public ApiResponse<Long> create(@Valid @RequestBody QualityIssueSaveRequest request) {
        return ApiResponse.success(qualityIssueService.create(request));
    }

    @PutMapping("/{issueId}")
    @RequirePermission("quality:update")
    public ApiResponse<Void> update(@PathVariable Long issueId,
                                    @RequestBody QualityIssueUpdateRequest request) {
        qualityIssueService.update(issueId, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{issueId}")
    @RequirePermission("quality:delete")
    public ApiResponse<Void> delete(@PathVariable Long issueId) {
        qualityIssueService.delete(issueId);
        return ApiResponse.success();
    }

    @GetMapping("/{issueId}/actions")
    @RequirePermission("quality:list")
    public ApiResponse<List<QualityIssueAction>> listActions(@PathVariable Long issueId) {
        return ApiResponse.success(qualityIssueService.listActions(issueId));
    }

    @PostMapping("/{issueId}/actions")
    @RequirePermission("quality:action")
    public ApiResponse<Long> addAction(@PathVariable Long issueId,
                                       @Valid @RequestBody QualityIssueActionSaveRequest request) {
        return ApiResponse.success(qualityIssueService.addAction(issueId, request));
    }

    @PutMapping("/{issueId}/actions/{actionId}")
    @RequirePermission("quality:action")
    public ApiResponse<Void> updateAction(@PathVariable Long issueId,
                                          @PathVariable Long actionId,
                                          @Valid @RequestBody QualityIssueActionSaveRequest request) {
        qualityIssueService.updateAction(issueId, actionId, request);
        return ApiResponse.success();
    }

    @PostMapping("/{issueId}/actions/{actionId}/complete")
    @RequirePermission("quality:action")
    public ApiResponse<Void> completeAction(@PathVariable Long issueId,
                                            @PathVariable Long actionId) {
        qualityIssueService.completeAction(issueId, actionId);
        return ApiResponse.success();
    }

    @PostMapping("/{issueId}/actions/{actionId}/verify")
    @RequirePermission("quality:action")
    public ApiResponse<Void> verifyAction(@PathVariable Long issueId,
                                          @PathVariable Long actionId,
                                          @RequestBody QualityIssueActionVerifyRequest request) {
        qualityIssueService.verifyAction(issueId, actionId, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{issueId}/actions/{actionId}")
    @RequirePermission("quality:action")
    public ApiResponse<Void> deleteAction(@PathVariable Long issueId,
                                          @PathVariable Long actionId) {
        qualityIssueService.deleteAction(issueId, actionId);
        return ApiResponse.success();
    }

    @PostMapping("/{issueId}/close")
    @RequirePermission("quality:close")
    public ApiResponse<Void> close(@PathVariable Long issueId,
                                   @RequestBody QualityIssueCloseRequest request) {
        qualityIssueService.close(issueId, request);
        return ApiResponse.success();
    }

    @PostMapping("/{issueId}/to-ecr")
    @RequirePermission("quality:to-ecr")
    public ApiResponse<QualityIssueEcrResult> toEcr(@PathVariable Long issueId,
                                                    @RequestBody QualityIssueToEcrRequest request) {
        return ApiResponse.success(qualityIssueService.toEcr(issueId, request));
    }
}
