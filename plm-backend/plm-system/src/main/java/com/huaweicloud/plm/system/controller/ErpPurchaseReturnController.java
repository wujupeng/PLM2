package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ErpPurchaseReturnQuery;
import com.huaweicloud.plm.system.dto.ErpPurchaseReturnSaveRequest;
import com.huaweicloud.plm.system.entity.ErpPurchaseReturn;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ErpPurchaseReturnService;
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
 * 采购退货接口（G3-N3a ERP 采购管理）：
 * 采购退货单登记、分页查询与删除。
 */
@RestController
@RequestMapping("/erp/purchase/returns")
@RequiredArgsConstructor
public class ErpPurchaseReturnController {

    private final ErpPurchaseReturnService service;

    @GetMapping
    @RequirePermission("erp:purchase:return:list")
    public ApiResponse<PageResult<ErpPurchaseReturn>> page(ErpPurchaseReturnQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("erp:purchase:return:list")
    public ApiResponse<ErpPurchaseReturn> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("erp:purchase:return:manage")
    public ApiResponse<Long> create(@Valid @RequestBody ErpPurchaseReturnSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("erp:purchase:return:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody ErpPurchaseReturnSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("erp:purchase:return:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
