package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.WmsRackQuery;
import com.huaweicloud.plm.system.dto.WmsRackSaveRequest;
import com.huaweicloud.plm.system.entity.WmsRack;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.WmsRackService;
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
 * 货架接口（对应货架）：
 * 货架登记、分页查询与删除。
 */
@RestController
@RequestMapping("/wms/base/racks")
@RequiredArgsConstructor
public class WmsRackController {

    private final WmsRackService service;

    @GetMapping
    @RequirePermission("wms:base:rack:list")
    public ApiResponse<PageResult<WmsRack>> page(WmsRackQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("wms:base:rack:list")
    public ApiResponse<WmsRack> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("wms:base:rack:manage")
    public ApiResponse<Long> create(@Valid @RequestBody WmsRackSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("wms:base:rack:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody WmsRackSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("wms:base:rack:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
