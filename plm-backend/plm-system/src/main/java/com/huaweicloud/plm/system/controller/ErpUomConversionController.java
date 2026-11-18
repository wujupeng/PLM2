package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ErpUomConversionQuery;
import com.huaweicloud.plm.system.dto.ErpUomConversionSaveRequest;
import com.huaweicloud.plm.system.entity.ErpUomConversion;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ErpUomConversionService;
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
 * 计量单位换算接口（G3-N1 ERP 基础资料 WBS T021）：
 * 计量单位换算登记、分页查询与删除。
 */
@RestController
@RequestMapping("/erp/base/uom-conversions")
@RequiredArgsConstructor
public class ErpUomConversionController {

    private final ErpUomConversionService service;

    @GetMapping
    @RequirePermission("erp:base:uomconversion:list")
    public ApiResponse<PageResult<ErpUomConversion>> page(ErpUomConversionQuery query) {
        return ApiResponse.success(service.pageUomConversions(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("erp:base:uomconversion:list")
    public ApiResponse<ErpUomConversion> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("erp:base:uomconversion:manage")
    public ApiResponse<Long> create(@Valid @RequestBody ErpUomConversionSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("erp:base:uomconversion:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody ErpUomConversionSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("erp:base:uomconversion:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
