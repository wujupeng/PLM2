package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ErpBarcodeScanQuery;
import com.huaweicloud.plm.system.dto.ErpBarcodeScanSaveRequest;
import com.huaweicloud.plm.system.entity.ErpBarcodeScan;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ErpBarcodeScanService;
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
 * 扫描校验接口（对应 G3-N7a ERP 条码管理）：
 * 扫描记录登记、分页查询与删除。
 */
@RestController
@RequestMapping("/erp/barcode/scans")
@RequiredArgsConstructor
public class ErpBarcodeScanController {

    private final ErpBarcodeScanService service;

    @GetMapping
    @RequirePermission("erp:barcode:scan:list")
    public ApiResponse<PageResult<ErpBarcodeScan>> page(ErpBarcodeScanQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("erp:barcode:scan:list")
    public ApiResponse<ErpBarcodeScan> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("erp:barcode:scan:manage")
    public ApiResponse<Long> create(@Valid @RequestBody ErpBarcodeScanSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("erp:barcode:scan:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody ErpBarcodeScanSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("erp:barcode:scan:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
