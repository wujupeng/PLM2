package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.BizEcrRiskReviewSaveRequest;
import com.huaweicloud.plm.system.dto.OaBizFlowQuery;
import com.huaweicloud.plm.system.entity.OaBizEcrRiskReview;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaBizEcrRiskReviewService;
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

/**
 * 设计工程变更风险评审接口（OA-DEV-075）：列表、详情、保存并提交、关联 PLM 变更、撤回与删除。
 */
@RestController
@RequestMapping("/oa/biz/ecr-risk-reviews")
@RequiredArgsConstructor
public class OaBizEcrRiskReviewController {

    private final OaBizEcrRiskReviewService ecrRiskReviewService;

    /** ECR 风险评审单分页。 */
    @GetMapping
    @RequirePermission("oa:biz:rd:list")
    public ApiResponse<PageResult<OaBizEcrRiskReview>> page(OaBizFlowQuery query) {
        return ApiResponse.success(ecrRiskReviewService.page(query, query.getApplicantUserId()));
    }

    @GetMapping("/{id}")
    @RequirePermission("oa:biz:rd:list")
    public ApiResponse<OaBizEcrRiskReview> detail(@PathVariable Long id) {
        return ApiResponse.success(ecrRiskReviewService.detail(id));
    }

    @PostMapping
    @RequirePermission("oa:biz:rd:apply")
    public ApiResponse<Long> create(@Valid @RequestBody BizEcrRiskReviewSaveRequest request) {
        return ApiResponse.success(ecrRiskReviewService.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("oa:biz:rd:apply")
    public ApiResponse<Void> update(@PathVariable Long id, @Valid @RequestBody BizEcrRiskReviewSaveRequest request) {
        ecrRiskReviewService.save(id, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{id}")
    @RequirePermission("oa:biz:rd:apply")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        ecrRiskReviewService.delete(id);
        return ApiResponse.success();
    }

    /** 撤回：仅流程审批中的单据可撤回。 */
    @PutMapping("/{id}/cancel")
    @RequirePermission("oa:biz:rd:apply")
    public ApiResponse<Void> cancel(@PathVariable Long id) {
        ecrRiskReviewService.withdraw(id);
        return ApiResponse.success();
    }

    /** 关联 PLM 工程变更号（PLM 为技术变更权威记录）。 */
    @PutMapping("/{id}/plm-change")
    @RequirePermission("oa:biz:rd:manage")
    public ApiResponse<Void> linkPlmChange(@PathVariable Long id,
                                           @RequestParam(required = false) String plmChangeNo,
                                           @RequestParam(required = false) String plmChangeStatus) {
        ecrRiskReviewService.linkPlmChange(id, plmChangeNo, plmChangeStatus);
        return ApiResponse.success();
    }
}
