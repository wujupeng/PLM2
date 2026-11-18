package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ErpInventoryConversionQuery;
import com.huaweicloud.plm.system.dto.ErpInventoryConversionSaveRequest;
import com.huaweicloud.plm.system.entity.ErpInventoryConversion;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ErpInventoryConversionService;
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
 * 形态转换单接口（对应 WBS T027 库存核算、T097 库存业务，属 G3 ERP）：
 * 形态转换登记、分页查询与删除。
 */
@RestController
@RequestMapping("/erp/inventory/conversions")
@RequiredArgsConstructor
public class ErpInventoryConversionController {

    private final ErpInventoryConversionService service;

    @GetMapping
    @RequirePermission("erp:inventory:conversion:list")
    public ApiResponse<PageResult<ErpInventoryConversion>> page(ErpInventoryConversionQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("erp:inventory:conversion:list")
    public ApiResponse<ErpInventoryConversion> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("erp:inventory:conversion:manage")
    public ApiResponse<Long> create(@Valid @RequestBody ErpInventoryConversionSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("erp:inventory:conversion:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody ErpInventoryConversionSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("erp:inventory:conversion:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
