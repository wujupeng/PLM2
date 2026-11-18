package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ErpBarcodeQuery;
import com.huaweicloud.plm.system.dto.ErpBarcodeSaveRequest;
import com.huaweicloud.plm.system.entity.ErpBarcode;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ErpBarcodeService;
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
 * 条码生成接口（对应 WBS G3-N7a ERP 条码管理）：
 * 条码登记、分页查询与删除。
 */
@RestController
@RequestMapping("/erp/barcode/records")
@RequiredArgsConstructor
public class ErpBarcodeController {

    private final ErpBarcodeService service;

    @GetMapping
    @RequirePermission("erp:barcode:record:list")
    public ApiResponse<PageResult<ErpBarcode>> page(ErpBarcodeQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("erp:barcode:record:list")
    public ApiResponse<ErpBarcode> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("erp:barcode:record:manage")
    public ApiResponse<Long> create(@Valid @RequestBody ErpBarcodeSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("erp:barcode:record:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody ErpBarcodeSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("erp:barcode:record:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
