package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ErpDeliveryReviewQuery;
import com.huaweicloud.plm.system.dto.ErpDeliveryReviewSaveRequest;
import com.huaweicloud.plm.system.entity.ErpDeliveryReview;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ErpDeliveryReviewService;
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
 * 交期评审接口（G3-N2 ERP 销售管理）：
 * 交期评审登记、分页查询与删除。
 */
@RestController
@RequestMapping("/erp/sales/delivery-reviews")
@RequiredArgsConstructor
public class ErpDeliveryReviewController {

    private final ErpDeliveryReviewService service;

    @GetMapping
    @RequirePermission("erp:sales:deliveryreview:list")
    public ApiResponse<PageResult<ErpDeliveryReview>> page(ErpDeliveryReviewQuery query) {
        return ApiResponse.success(service.pageDeliveryReviews(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("erp:sales:deliveryreview:list")
    public ApiResponse<ErpDeliveryReview> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("erp:sales:deliveryreview:manage")
    public ApiResponse<Long> create(@Valid @RequestBody ErpDeliveryReviewSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("erp:sales:deliveryreview:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody ErpDeliveryReviewSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("erp:sales:deliveryreview:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
