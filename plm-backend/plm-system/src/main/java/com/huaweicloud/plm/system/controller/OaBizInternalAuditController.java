package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.BizInternalAuditSaveRequest;
import com.huaweicloud.plm.system.dto.OaBizFlowQuery;
import com.huaweicloud.plm.system.entity.OaBizInternalAudit;
import com.huaweicloud.plm.system.entity.OaBizInternalAuditIssue;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaBizInternalAuditService;
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
 * 内部审核实施计划接口（OA-DEV-074）：列表、详情、问题清单、保存并提交、报告编制、关闭、撤回与删除。
 */
@RestController
@RequestMapping("/oa/biz/internal-audits")
@RequiredArgsConstructor
public class OaBizInternalAuditController {

    private final OaBizInternalAuditService internalAuditService;

    /** 内部审核计划分页。 */
    @GetMapping
    @RequirePermission("oa:biz:quality:list")
    public ApiResponse<PageResult<OaBizInternalAudit>> page(OaBizFlowQuery query) {
        return ApiResponse.success(internalAuditService.page(query, query.getApplicantUserId()));
    }

    @GetMapping("/{id}")
    @RequirePermission("oa:biz:quality:list")
    public ApiResponse<OaBizInternalAudit> detail(@PathVariable Long id) {
        return ApiResponse.success(internalAuditService.detail(id));
    }

    /** 整改问题清单。 */
    @GetMapping("/{id}/issues")
    @RequirePermission("oa:biz:quality:manage")
    public ApiResponse<List<OaBizInternalAuditIssue>> listIssues(@PathVariable Long id) {
        return ApiResponse.success(internalAuditService.listIssues(id));
    }

    @PostMapping
    @RequirePermission("oa:biz:quality:apply")
    public ApiResponse<Long> create(@Valid @RequestBody BizInternalAuditSaveRequest request) {
        return ApiResponse.success(internalAuditService.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("oa:biz:quality:apply")
    public ApiResponse<Void> update(@PathVariable Long id, @Valid @RequestBody BizInternalAuditSaveRequest request) {
        internalAuditService.save(id, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{id}")
    @RequirePermission("oa:biz:quality:apply")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        internalAuditService.delete(id);
        return ApiResponse.success();
    }

    /** 撤回：仅流程审批中的单据可撤回。 */
    @PutMapping("/{id}/cancel")
    @RequirePermission("oa:biz:quality:apply")
    public ApiResponse<Void> cancel(@PathVariable Long id) {
        internalAuditService.withdraw(id);
        return ApiResponse.success();
    }

    /** 报告编制阶段。 */
    @PutMapping("/{id}/report")
    @RequirePermission("oa:biz:quality:manage")
    public ApiResponse<Void> report(@PathVariable Long id, @RequestParam(required = false) String auditConclusion) {
        internalAuditService.report(id, auditConclusion);
        return ApiResponse.success();
    }

    /** 关闭审核计划。 */
    @PutMapping("/{id}/close")
    @RequirePermission("oa:biz:quality:manage")
    public ApiResponse<Void> close(@PathVariable Long id) {
        internalAuditService.close(id);
        return ApiResponse.success();
    }
}
