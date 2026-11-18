package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.BizPriceApprovalSaveRequest;
import com.huaweicloud.plm.system.dto.OaBizFlowQuery;
import com.huaweicloud.plm.system.entity.OaBizPriceApproval;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaBizPriceApprovalService;
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
 * 价格审批接口（OA-DEV-063）：列表、详情、保存并提交、撤回与删除。
 */
@RestController
@RequestMapping("/oa/biz/price-approvals")
@RequiredArgsConstructor
public class OaBizPriceApprovalController {

    private final OaBizPriceApprovalService priceApprovalService;

    /** 价格审批单分页。 */
    @GetMapping
    @RequirePermission("oa:biz:sales:list")
    public ApiResponse<PageResult<OaBizPriceApproval>> page(OaBizFlowQuery query) {
        return ApiResponse.success(priceApprovalService.page(query, query.getApplicantUserId()));
    }

    @GetMapping("/{id}")
    @RequirePermission("oa:biz:sales:list")
    public ApiResponse<OaBizPriceApproval> detail(@PathVariable Long id) {
        return ApiResponse.success(priceApprovalService.detail(id));
    }

    @PostMapping
    @RequirePermission("oa:biz:sales:apply")
    public ApiResponse<Long> create(@Valid @RequestBody BizPriceApprovalSaveRequest request) {
        return ApiResponse.success(priceApprovalService.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("oa:biz:sales:apply")
    public ApiResponse<Void> update(@PathVariable Long id, @Valid @RequestBody BizPriceApprovalSaveRequest request) {
        priceApprovalService.save(id, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{id}")
    @RequirePermission("oa:biz:sales:apply")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        priceApprovalService.delete(id);
        return ApiResponse.success();
    }

    /** 撤回：仅流程审批中的单据可撤回。 */
    @PutMapping("/{id}/cancel")
    @RequirePermission("oa:biz:sales:apply")
    public ApiResponse<Void> cancel(@PathVariable Long id) {
        priceApprovalService.withdraw(id);
        return ApiResponse.success();
    }
}
