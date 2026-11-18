package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.WmsAsnQuery;
import com.huaweicloud.plm.system.dto.WmsAsnSaveRequest;
import com.huaweicloud.plm.system.entity.WmsAsn;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.WmsAsnService;
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
 * 收货通知单接口（对应收货通知单）：
 * 收货通知单登记、分页查询与删除。
 */
@RestController
@RequestMapping("/wms/inbound/asns")
@RequiredArgsConstructor
public class WmsAsnController {

    private final WmsAsnService service;

    @GetMapping
    @RequirePermission("wms:inbound:asn:list")
    public ApiResponse<PageResult<WmsAsn>> page(WmsAsnQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("wms:inbound:asn:list")
    public ApiResponse<WmsAsn> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("wms:inbound:asn:manage")
    public ApiResponse<Long> create(@Valid @RequestBody WmsAsnSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("wms:inbound:asn:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody WmsAsnSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("wms:inbound:asn:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
