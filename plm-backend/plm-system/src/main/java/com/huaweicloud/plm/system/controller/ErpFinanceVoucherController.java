package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ErpFinanceVoucherDetailResponse;
import com.huaweicloud.plm.system.dto.ErpFinanceVoucherLineSaveRequest;
import com.huaweicloud.plm.system.dto.ErpFinanceVoucherQuery;
import com.huaweicloud.plm.system.dto.ErpFinanceVoucherSaveRequest;
import com.huaweicloud.plm.system.entity.ErpFinanceVoucher;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ErpFinanceVoucherService;
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
 * 记账凭证接口（对应 WBS T028 ERP 财务，属 G3-N6 ERP 财务）：
 * 记账凭证头与分录行的登记、分页查询、分录维护与删除。
 */
@RestController
@RequestMapping("/erp/finance/vouchers")
@RequiredArgsConstructor
public class ErpFinanceVoucherController {

    private final ErpFinanceVoucherService service;

    @GetMapping
    @RequirePermission("erp:finance:voucher:list")
    public ApiResponse<PageResult<ErpFinanceVoucher>> page(ErpFinanceVoucherQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("erp:finance:voucher:list")
    public ApiResponse<ErpFinanceVoucherDetailResponse> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("erp:finance:voucher:manage")
    public ApiResponse<Long> create(@Valid @RequestBody ErpFinanceVoucherSaveRequest request) {
        return ApiResponse.success(service.create(request));
    }

    @PutMapping("/{id}")
    @RequirePermission("erp:finance:voucher:manage")
    public ApiResponse<Void> update(@PathVariable Long id, @Valid @RequestBody ErpFinanceVoucherSaveRequest request) {
        service.update(id, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{id}")
    @RequirePermission("erp:finance:voucher:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }

    @PostMapping("/{headerId}/lines")
    @RequirePermission("erp:finance:voucher:manage")
    public ApiResponse<Long> addLine(@PathVariable Long headerId, @Valid @RequestBody ErpFinanceVoucherLineSaveRequest request) {
        return ApiResponse.success(service.addLine(headerId, request));
    }

    @PutMapping("/lines/{lineId}")
    @RequirePermission("erp:finance:voucher:manage")
    public ApiResponse<Void> updateLine(@PathVariable Long lineId, @Valid @RequestBody ErpFinanceVoucherLineSaveRequest request) {
        service.updateLine(lineId, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/lines/{lineId}")
    @RequirePermission("erp:finance:voucher:manage")
    public ApiResponse<Void> deleteLine(@PathVariable Long lineId) {
        service.deleteLine(lineId);
        return ApiResponse.success();
    }
}
