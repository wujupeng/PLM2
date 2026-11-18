package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ErpUomQuery;
import com.huaweicloud.plm.system.dto.ErpUomSaveRequest;
import com.huaweicloud.plm.system.entity.ErpUom;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ErpUomService;
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
 * 计量单位业务档案接口（G3-N1 ERP 基础资料 WBS T021）：
 * 计量单位档案登记、分页查询与删除。
 */
@RestController
@RequestMapping("/erp/base/uoms")
@RequiredArgsConstructor
public class ErpUomController {

    private final ErpUomService service;

    @GetMapping
    @RequirePermission("erp:base:uom:list")
    public ApiResponse<PageResult<ErpUom>> page(ErpUomQuery query) {
        return ApiResponse.success(service.pageUoms(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("erp:base:uom:list")
    public ApiResponse<ErpUom> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("erp:base:uom:manage")
    public ApiResponse<Long> create(@Valid @RequestBody ErpUomSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("erp:base:uom:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody ErpUomSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("erp:base:uom:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
