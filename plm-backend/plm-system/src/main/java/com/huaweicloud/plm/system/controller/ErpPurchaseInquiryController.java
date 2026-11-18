package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ErpPurchaseInquiryQuery;
import com.huaweicloud.plm.system.dto.ErpPurchaseInquirySaveRequest;
import com.huaweicloud.plm.system.entity.ErpPurchaseInquiry;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ErpPurchaseInquiryService;
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
 * 采购询价单接口（对应 WBS T023 采购管理，属 G3 ERP）：
 * 采购询价登记、分页查询与删除。
 */
@RestController
@RequestMapping("/erp/purchase/inquiries")
@RequiredArgsConstructor
public class ErpPurchaseInquiryController {

    private final ErpPurchaseInquiryService service;

    @GetMapping
    @RequirePermission("erp:purchase:inquiry:list")
    public ApiResponse<PageResult<ErpPurchaseInquiry>> page(ErpPurchaseInquiryQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("erp:purchase:inquiry:list")
    public ApiResponse<ErpPurchaseInquiry> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("erp:purchase:inquiry:manage")
    public ApiResponse<Long> create(@Valid @RequestBody ErpPurchaseInquirySaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("erp:purchase:inquiry:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody ErpPurchaseInquirySaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("erp:purchase:inquiry:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
