package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.BizOrderVoucherSaveRequest;
import com.huaweicloud.plm.system.dto.OaBizFlowQuery;
import com.huaweicloud.plm.system.entity.OaBizOrderVoucher;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaBizOrderVoucherService;
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
 * 订货传票接口（OA-DEV-066）：列表、详情、保存并提交、撤回与删除。
 */
@RestController
@RequestMapping("/oa/biz/order-vouchers")
@RequiredArgsConstructor
public class OaBizOrderVoucherController {

    private final OaBizOrderVoucherService orderVoucherService;

    /** 订货传票分页。 */
    @GetMapping
    @RequirePermission("oa:biz:purchase:list")
    public ApiResponse<PageResult<OaBizOrderVoucher>> page(OaBizFlowQuery query) {
        return ApiResponse.success(orderVoucherService.page(query, query.getApplicantUserId()));
    }

    @GetMapping("/{id}")
    @RequirePermission("oa:biz:purchase:list")
    public ApiResponse<OaBizOrderVoucher> detail(@PathVariable Long id) {
        return ApiResponse.success(orderVoucherService.detail(id));
    }

    @PostMapping
    @RequirePermission("oa:biz:purchase:apply")
    public ApiResponse<Long> create(@Valid @RequestBody BizOrderVoucherSaveRequest request) {
        return ApiResponse.success(orderVoucherService.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("oa:biz:purchase:apply")
    public ApiResponse<Void> update(@PathVariable Long id, @Valid @RequestBody BizOrderVoucherSaveRequest request) {
        orderVoucherService.save(id, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{id}")
    @RequirePermission("oa:biz:purchase:apply")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        orderVoucherService.delete(id);
        return ApiResponse.success();
    }

    /** 撤回：仅流程审批中的单据可撤回。 */
    @PutMapping("/{id}/cancel")
    @RequirePermission("oa:biz:purchase:apply")
    public ApiResponse<Void> cancel(@PathVariable Long id) {
        orderVoucherService.withdraw(id);
        return ApiResponse.success();
    }
}
