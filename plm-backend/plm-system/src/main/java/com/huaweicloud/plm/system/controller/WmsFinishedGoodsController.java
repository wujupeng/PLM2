package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.WmsFinishedGoodsQuery;
import com.huaweicloud.plm.system.dto.WmsFinishedGoodsSaveRequest;
import com.huaweicloud.plm.system.entity.WmsFinishedGoods;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.WmsFinishedGoodsService;
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
 * 成品入库单接口：成品入库登记、分页查询与删除。
 */
@RestController
@RequestMapping("/wms/outbound/finished-goods")
@RequiredArgsConstructor
public class WmsFinishedGoodsController {

    private final WmsFinishedGoodsService service;

    @GetMapping
    @RequirePermission("wms:outbound:finished:list")
    public ApiResponse<PageResult<WmsFinishedGoods>> page(WmsFinishedGoodsQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("wms:outbound:finished:list")
    public ApiResponse<WmsFinishedGoods> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("wms:outbound:finished:manage")
    public ApiResponse<Long> create(@Valid @RequestBody WmsFinishedGoodsSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("wms:outbound:finished:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody WmsFinishedGoodsSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("wms:outbound:finished:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
