package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.BizInspectionRequestSaveRequest;
import com.huaweicloud.plm.system.dto.OaBizFlowQuery;
import com.huaweicloud.plm.system.entity.OaBizInspectionRequest;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaBizInspectionRequestService;
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
 * 检测委托接口（OA-DEV-070）：列表、详情、保存并提交、结果登记、撤回与删除。
 */
@RestController
@RequestMapping("/oa/biz/inspection-requests")
@RequiredArgsConstructor
public class OaBizInspectionRequestController {

    private final OaBizInspectionRequestService inspectionRequestService;

    /** 检测委托单分页。 */
    @GetMapping
    @RequirePermission("oa:biz:quality:list")
    public ApiResponse<PageResult<OaBizInspectionRequest>> page(OaBizFlowQuery query) {
        return ApiResponse.success(inspectionRequestService.page(query, query.getApplicantUserId()));
    }

    @GetMapping("/{id}")
    @RequirePermission("oa:biz:quality:list")
    public ApiResponse<OaBizInspectionRequest> detail(@PathVariable Long id) {
        return ApiResponse.success(inspectionRequestService.detail(id));
    }

    @PostMapping
    @RequirePermission("oa:biz:quality:apply")
    public ApiResponse<Long> create(@Valid @RequestBody BizInspectionRequestSaveRequest request) {
        return ApiResponse.success(inspectionRequestService.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("oa:biz:quality:apply")
    public ApiResponse<Void> update(@PathVariable Long id, @Valid @RequestBody BizInspectionRequestSaveRequest request) {
        inspectionRequestService.save(id, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{id}")
    @RequirePermission("oa:biz:quality:apply")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        inspectionRequestService.delete(id);
        return ApiResponse.success();
    }

    /** 撤回：仅流程审批中的单据可撤回。 */
    @PutMapping("/{id}/cancel")
    @RequirePermission("oa:biz:quality:apply")
    public ApiResponse<Void> cancel(@PathVariable Long id) {
        inspectionRequestService.withdraw(id);
        return ApiResponse.success();
    }

    /** 登记检测结果：委托受理后由实验室录入结果（QMS 为权威）。 */
    @PutMapping("/{id}/result")
    @RequirePermission("oa:biz:quality:manage")
    public ApiResponse<Void> recordResult(@PathVariable Long id,
                                          @RequestParam(required = false) String resultStatus,
                                          @RequestParam(required = false) String resultDesc,
                                          @RequestParam(required = false) String reportAttachmentJson,
                                          @RequestParam(required = false) String qmsRefNo) {
        inspectionRequestService.recordResult(id, resultStatus, resultDesc, reportAttachmentJson, qmsRefNo);
        return ApiResponse.success();
    }
}
