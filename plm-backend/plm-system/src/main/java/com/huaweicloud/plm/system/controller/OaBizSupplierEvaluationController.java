package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.BizSupplierEvaluationSaveRequest;
import com.huaweicloud.plm.system.dto.OaBizFlowQuery;
import com.huaweicloud.plm.system.entity.OaBizSupplierEvalItem;
import com.huaweicloud.plm.system.entity.OaBizSupplierEvaluation;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaBizSupplierEvaluationService;
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
 * 供方考评接口（OA-DEV-068）：列表、详情、评分项查询、保存并提交、撤回与删除。
 */
@RestController
@RequestMapping("/oa/biz/supplier-evaluations")
@RequiredArgsConstructor
public class OaBizSupplierEvaluationController {

    private final OaBizSupplierEvaluationService supplierEvaluationService;

    /** 供方考评单分页。 */
    @GetMapping
    @RequirePermission("oa:biz:purchase:list")
    public ApiResponse<PageResult<OaBizSupplierEvaluation>> page(OaBizFlowQuery query) {
        return ApiResponse.success(supplierEvaluationService.page(query, query.getApplicantUserId()));
    }

    @GetMapping("/{id}")
    @RequirePermission("oa:biz:purchase:list")
    public ApiResponse<OaBizSupplierEvaluation> detail(@PathVariable Long id) {
        return ApiResponse.success(supplierEvaluationService.detail(id));
    }

    /** 评分项明细。 */
    @GetMapping("/{id}/items")
    @RequirePermission("oa:biz:purchase:manage")
    public ApiResponse<List<OaBizSupplierEvalItem>> listItems(@PathVariable Long id) {
        return ApiResponse.success(supplierEvaluationService.listItems(id));
    }

    @PostMapping
    @RequirePermission("oa:biz:purchase:apply")
    public ApiResponse<Long> create(@Valid @RequestBody BizSupplierEvaluationSaveRequest request) {
        return ApiResponse.success(supplierEvaluationService.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("oa:biz:purchase:apply")
    public ApiResponse<Void> update(@PathVariable Long id, @Valid @RequestBody BizSupplierEvaluationSaveRequest request) {
        supplierEvaluationService.save(id, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{id}")
    @RequirePermission("oa:biz:purchase:apply")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        supplierEvaluationService.delete(id);
        return ApiResponse.success();
    }

    /** 撤回：仅流程审批中的单据可撤回。 */
    @PutMapping("/{id}/cancel")
    @RequirePermission("oa:biz:purchase:apply")
    public ApiResponse<Void> cancel(@PathVariable Long id) {
        supplierEvaluationService.withdraw(id);
        return ApiResponse.success();
    }
}
