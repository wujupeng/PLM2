package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ErpBarcodeReprintQuery;
import com.huaweicloud.plm.system.dto.ErpBarcodeReprintSaveRequest;
import com.huaweicloud.plm.system.entity.ErpBarcodeReprint;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ErpBarcodeReprintService;
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
 * 条码补打记录接口（对应 G3-N7a ERP 条码管理）：
 * 补打记录登记、分页查询与删除。
 */
@RestController
@RequestMapping("/erp/barcode/reprints")
@RequiredArgsConstructor
public class ErpBarcodeReprintController {

    private final ErpBarcodeReprintService service;

    @GetMapping
    @RequirePermission("erp:barcode:reprint:list")
    public ApiResponse<PageResult<ErpBarcodeReprint>> page(ErpBarcodeReprintQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("erp:barcode:reprint:list")
    public ApiResponse<ErpBarcodeReprint> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("erp:barcode:reprint:manage")
    public ApiResponse<Long> create(@Valid @RequestBody ErpBarcodeReprintSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("erp:barcode:reprint:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody ErpBarcodeReprintSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("erp:barcode:reprint:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
