package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.WmsVmiScanQuery;
import com.huaweicloud.plm.system.dto.WmsVmiScanSaveRequest;
import com.huaweicloud.plm.system.entity.WmsVmiScan;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.WmsVmiScanService;
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
 * VMI 扫码收发接口：扫码收发登记、分页查询与删除。
 */
@RestController
@RequestMapping("/wms/vmi/scans")
@RequiredArgsConstructor
public class WmsVmiScanController {

    private final WmsVmiScanService service;

    @GetMapping
    @RequirePermission("wms:vmi:scan:list")
    public ApiResponse<PageResult<WmsVmiScan>> page(WmsVmiScanQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("wms:vmi:scan:list")
    public ApiResponse<WmsVmiScan> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("wms:vmi:scan:manage")
    public ApiResponse<Long> create(@Valid @RequestBody WmsVmiScanSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("wms:vmi:scan:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody WmsVmiScanSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("wms:vmi:scan:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
