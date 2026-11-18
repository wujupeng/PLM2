package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.WmsBinQuery;
import com.huaweicloud.plm.system.dto.WmsBinSaveRequest;
import com.huaweicloud.plm.system.entity.WmsBin;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.WmsBinService;
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
 * 库位管理接口（对应库位）：
 * 库位登记、分页查询与删除。
 */
@RestController
@RequestMapping("/wms/base/bins")
@RequiredArgsConstructor
public class WmsBinController {

    private final WmsBinService service;

    @GetMapping
    @RequirePermission("wms:base:bin:list")
    public ApiResponse<PageResult<WmsBin>> page(WmsBinQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("wms:base:bin:list")
    public ApiResponse<WmsBin> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("wms:base:bin:manage")
    public ApiResponse<Long> create(@Valid @RequestBody WmsBinSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("wms:base:bin:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody WmsBinSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("wms:base:bin:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
