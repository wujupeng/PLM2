package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ErpCompletionReceiptQuery;
import com.huaweicloud.plm.system.dto.ErpCompletionReceiptSaveRequest;
import com.huaweicloud.plm.system.entity.ErpCompletionReceipt;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ErpCompletionReceiptService;
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
 * 完工入库单接口（对应 WBS T026 生产管理、T096 生产订单与补料，属 G3 ERP）：
 * 完工入库登记、分页查询与删除。
 */
@RestController
@RequestMapping("/erp/production/completion-receipts")
@RequiredArgsConstructor
public class ErpCompletionReceiptController {

    private final ErpCompletionReceiptService service;

    @GetMapping
    @RequirePermission("erp:production:receipt:list")
    public ApiResponse<PageResult<ErpCompletionReceipt>> page(ErpCompletionReceiptQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("erp:production:receipt:list")
    public ApiResponse<ErpCompletionReceipt> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("erp:production:receipt:manage")
    public ApiResponse<Long> create(@Valid @RequestBody ErpCompletionReceiptSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("erp:production:receipt:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody ErpCompletionReceiptSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("erp:production:receipt:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
