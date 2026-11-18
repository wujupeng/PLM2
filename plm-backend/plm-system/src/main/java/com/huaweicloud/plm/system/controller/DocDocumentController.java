package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.DocDistributionRequest;
import com.huaweicloud.plm.system.dto.DocDocumentDetailResponse;
import com.huaweicloud.plm.system.dto.DocDocumentQuery;
import com.huaweicloud.plm.system.dto.DocDocumentSaveRequest;
import com.huaweicloud.plm.system.dto.DocObsoleteRequest;
import com.huaweicloud.plm.system.dto.DocRelationSaveRequest;
import com.huaweicloud.plm.system.dto.DocReleaseRequest;
import com.huaweicloud.plm.system.dto.DocReviewDecideRequest;
import com.huaweicloud.plm.system.dto.DocSubmitRequest;
import com.huaweicloud.plm.system.dto.DocVersionCompareResponse;
import com.huaweicloud.plm.system.dto.DocVersionSaveRequest;
import com.huaweicloud.plm.system.entity.DocApprovalLog;
import com.huaweicloud.plm.system.entity.DocDistribution;
import com.huaweicloud.plm.system.entity.DocDocument;
import com.huaweicloud.plm.system.entity.DocRelation;
import com.huaweicloud.plm.system.entity.DocReviewTask;
import com.huaweicloud.plm.system.entity.DocVersion;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.DocDocumentService;
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

import java.util.List;

/**
 * 图文档主档、版本、评审、审批、分发接口（DEV-034 ~ DEV-038）。
 */
@RestController
@RequestMapping("/document/documents")
@RequiredArgsConstructor
public class DocDocumentController {

    private final DocDocumentService docDocumentService;

    @GetMapping
    @RequirePermission("doc:list")
    public ApiResponse<PageResult<DocDocument>> page(DocDocumentQuery query) {
        return ApiResponse.success(docDocumentService.page(query));
    }

    @GetMapping("/options")
    @RequirePermission("doc:list")
    public ApiResponse<List<DocDocument>> options() {
        return ApiResponse.success(docDocumentService.options());
    }

    @GetMapping("/by-material/{materialCode}")
    @RequirePermission("doc:list")
    public ApiResponse<List<DocDocument>> listByMaterial(@PathVariable String materialCode) {
        return ApiResponse.success(docDocumentService.listByMaterial(materialCode));
    }

    @GetMapping("/{documentId}")
    @RequirePermission("doc:list")
    public ApiResponse<DocDocumentDetailResponse> getById(@PathVariable Long documentId) {
        return ApiResponse.success(docDocumentService.getDetail(documentId));
    }

    @GetMapping("/{documentId}/versions")
    @RequirePermission("doc:list")
    public ApiResponse<List<DocVersion>> listVersions(@PathVariable Long documentId) {
        return ApiResponse.success(docDocumentService.listVersions(documentId));
    }

    @GetMapping("/{documentId}/versions/compare")
    @RequirePermission("doc:compare")
    public ApiResponse<DocVersionCompareResponse> compareVersions(@PathVariable Long documentId,
                                                                  @RequestParam String leftVersionNo,
                                                                  @RequestParam String rightVersionNo) {
        return ApiResponse.success(docDocumentService.compareVersions(documentId, leftVersionNo, rightVersionNo));
    }

    @PostMapping
    @RequirePermission("doc:create")
    public ApiResponse<Long> create(@Valid @RequestBody DocDocumentSaveRequest request) {
        return ApiResponse.success(docDocumentService.create(request));
    }

    @PutMapping("/{documentId}")
    @RequirePermission("doc:update")
    public ApiResponse<Void> update(@PathVariable Long documentId,
                                    @Valid @RequestBody DocDocumentSaveRequest request) {
        docDocumentService.update(documentId, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{documentId}")
    @RequirePermission("doc:delete")
    public ApiResponse<Void> delete(@PathVariable Long documentId) {
        docDocumentService.delete(documentId);
        return ApiResponse.success();
    }

    @PostMapping("/{documentId}/versions")
    @RequirePermission("doc:update")
    public ApiResponse<Long> addVersion(@PathVariable Long documentId,
                                        @RequestBody DocVersionSaveRequest request) {
        return ApiResponse.success(docDocumentService.addVersion(documentId, request));
    }

    @PutMapping("/{documentId}/versions/{versionId}/activate")
    @RequirePermission("doc:update")
    public ApiResponse<Void> activateVersion(@PathVariable Long documentId, @PathVariable Long versionId) {
        docDocumentService.activateVersion(documentId, versionId);
        return ApiResponse.success();
    }

    @PostMapping("/{documentId}/submit")
    @RequirePermission("doc:submit")
    public ApiResponse<Void> submit(@PathVariable Long documentId, @RequestBody DocSubmitRequest request) {
        docDocumentService.submit(documentId, request);
        return ApiResponse.success();
    }

    @GetMapping("/{documentId}/review-tasks")
    @RequirePermission("doc:list")
    public ApiResponse<List<DocReviewTask>> listReviewTasks(@PathVariable Long documentId,
                                                            @RequestParam(required = false) String versionNo) {
        return ApiResponse.success(docDocumentService.listReviewTasks(documentId, versionNo));
    }

    @PostMapping("/review-tasks/{taskId}/decide")
    @RequirePermission("doc:review")
    public ApiResponse<Void> decide(@PathVariable Long taskId,
                                    @Valid @RequestBody DocReviewDecideRequest request) {
        docDocumentService.decide(taskId, request);
        return ApiResponse.success();
    }

    @PostMapping("/{documentId}/release")
    @RequirePermission("doc:release")
    public ApiResponse<Void> release(@PathVariable Long documentId, @RequestBody DocReleaseRequest request) {
        docDocumentService.release(documentId, request);
        return ApiResponse.success();
    }

    @PostMapping("/{documentId}/obsolete")
    @RequirePermission("doc:obsolete")
    public ApiResponse<Void> obsolete(@PathVariable Long documentId, @RequestBody DocObsoleteRequest request) {
        docDocumentService.obsolete(documentId, request);
        return ApiResponse.success();
    }

    @GetMapping("/{documentId}/relations")
    @RequirePermission("doc:list")
    public ApiResponse<List<DocRelation>> listRelations(@PathVariable Long documentId) {
        return ApiResponse.success(docDocumentService.listRelations(documentId));
    }

    @PostMapping("/{documentId}/relations")
    @RequirePermission("doc:update")
    public ApiResponse<Long> addRelation(@PathVariable Long documentId,
                                         @Valid @RequestBody DocRelationSaveRequest request) {
        return ApiResponse.success(docDocumentService.addRelation(documentId, request));
    }

    @DeleteMapping("/relations/{relationId}")
    @RequirePermission("doc:update")
    public ApiResponse<Void> deleteRelation(@PathVariable Long relationId) {
        docDocumentService.deleteRelation(relationId);
        return ApiResponse.success();
    }

    @GetMapping("/{documentId}/distributions")
    @RequirePermission("doc:list")
    public ApiResponse<List<DocDistribution>> listDistributions(@PathVariable Long documentId) {
        return ApiResponse.success(docDocumentService.listDistributions(documentId));
    }

    @PostMapping("/{documentId}/distributions")
    @RequirePermission("doc:distribute")
    public ApiResponse<Long> distribute(@PathVariable Long documentId,
                                        @RequestBody DocDistributionRequest request) {
        return ApiResponse.success(docDocumentService.distribute(documentId, request));
    }

    @PutMapping("/distributions/{distributionId}/recall")
    @RequirePermission("doc:distribute")
    public ApiResponse<Void> recall(@PathVariable Long distributionId) {
        docDocumentService.recall(distributionId);
        return ApiResponse.success();
    }

    @GetMapping("/{documentId}/approval-logs")
    @RequirePermission("doc:list")
    public ApiResponse<List<DocApprovalLog>> listApprovalLogs(@PathVariable Long documentId) {
        return ApiResponse.success(docDocumentService.listApprovalLogs(documentId));
    }
}
