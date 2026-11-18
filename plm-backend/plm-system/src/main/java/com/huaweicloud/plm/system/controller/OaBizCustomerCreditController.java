package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.BizCustomerCreditSaveRequest;
import com.huaweicloud.plm.system.dto.OaBizFlowQuery;
import com.huaweicloud.plm.system.entity.OaBizCustomerCredit;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaBizCustomerCreditService;
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
 * 客户授信流程接口（OA-DEV-062）：列表、详情、保存并提交、撤回与删除。
 */
@RestController
@RequestMapping("/oa/biz/credits")
@RequiredArgsConstructor
public class OaBizCustomerCreditController {

    private final OaBizCustomerCreditService customerCreditService;

    /** 客户授信申请分页。 */
    @GetMapping
    @RequirePermission("oa:biz:sales:list")
    public ApiResponse<PageResult<OaBizCustomerCredit>> page(OaBizFlowQuery query) {
        return ApiResponse.success(customerCreditService.page(query, query.getApplicantUserId()));
    }

    @GetMapping("/{id}")
    @RequirePermission("oa:biz:sales:list")
    public ApiResponse<OaBizCustomerCredit> detail(@PathVariable Long id) {
        return ApiResponse.success(customerCreditService.detail(id));
    }

    @PostMapping
    @RequirePermission("oa:biz:sales:apply")
    public ApiResponse<Long> create(@Valid @RequestBody BizCustomerCreditSaveRequest request) {
        return ApiResponse.success(customerCreditService.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("oa:biz:sales:apply")
    public ApiResponse<Void> update(@PathVariable Long id, @Valid @RequestBody BizCustomerCreditSaveRequest request) {
        customerCreditService.save(id, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{id}")
    @RequirePermission("oa:biz:sales:apply")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        customerCreditService.delete(id);
        return ApiResponse.success();
    }

    /** 撤回：仅流程审批中的单据可撤回。 */
    @PutMapping("/{id}/cancel")
    @RequirePermission("oa:biz:sales:apply")
    public ApiResponse<Void> cancel(@PathVariable Long id) {
        customerCreditService.withdraw(id);
        return ApiResponse.success();
    }
}
