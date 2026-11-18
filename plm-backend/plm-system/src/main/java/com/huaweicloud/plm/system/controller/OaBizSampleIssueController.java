package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.BizSampleIssueSaveRequest;
import com.huaweicloud.plm.system.dto.OaBizFlowQuery;
import com.huaweicloud.plm.system.entity.OaBizSampleIssue;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaBizSampleIssueService;
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
 * 样品试制问题改善接口（OA-DEV-073）：列表、详情、保存并提交、进入验证、关闭、撤回与删除。
 */
@RestController
@RequestMapping("/oa/biz/sample-issues")
@RequiredArgsConstructor
public class OaBizSampleIssueController {

    private final OaBizSampleIssueService sampleIssueService;

    /** 样品试制问题单分页。 */
    @GetMapping
    @RequirePermission("oa:biz:rd:list")
    public ApiResponse<PageResult<OaBizSampleIssue>> page(OaBizFlowQuery query) {
        return ApiResponse.success(sampleIssueService.page(query, query.getApplicantUserId()));
    }

    @GetMapping("/{id}")
    @RequirePermission("oa:biz:rd:list")
    public ApiResponse<OaBizSampleIssue> detail(@PathVariable Long id) {
        return ApiResponse.success(sampleIssueService.detail(id));
    }

    @PostMapping
    @RequirePermission("oa:biz:rd:apply")
    public ApiResponse<Long> create(@Valid @RequestBody BizSampleIssueSaveRequest request) {
        return ApiResponse.success(sampleIssueService.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("oa:biz:rd:apply")
    public ApiResponse<Void> update(@PathVariable Long id, @Valid @RequestBody BizSampleIssueSaveRequest request) {
        sampleIssueService.save(id, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{id}")
    @RequirePermission("oa:biz:rd:apply")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        sampleIssueService.delete(id);
        return ApiResponse.success();
    }

    /** 撤回：仅流程审批中的单据可撤回。 */
    @PutMapping("/{id}/cancel")
    @RequirePermission("oa:biz:rd:apply")
    public ApiResponse<Void> cancel(@PathVariable Long id) {
        sampleIssueService.withdraw(id);
        return ApiResponse.success();
    }

    /** 进入验证阶段。 */
    @PutMapping("/{id}/start-verify")
    @RequirePermission("oa:biz:rd:manage")
    public ApiResponse<Void> startVerify(@PathVariable Long id) {
        sampleIssueService.startVerify(id);
        return ApiResponse.success();
    }

    /** 关闭问题：填写验证结果并关闭（流程通过后方可关闭）。 */
    @PutMapping("/{id}/close")
    @RequirePermission("oa:biz:rd:manage")
    public ApiResponse<Void> close(@PathVariable Long id, @RequestParam(required = false) String verifyResult) {
        sampleIssueService.close(id, verifyResult);
        return ApiResponse.success();
    }
}
