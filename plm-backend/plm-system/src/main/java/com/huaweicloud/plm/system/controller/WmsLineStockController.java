package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.WmsLineStockQuery;
import com.huaweicloud.plm.system.dto.WmsLineStockSaveRequest;
import com.huaweicloud.plm.system.dto.WmsLineStockTxnRequest;
import com.huaweicloud.plm.system.entity.WmsLineSideStock;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.WmsLineStockService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 线边库存与库存流水接口（N7，DEV-081）。
 */
@RestController
@RequestMapping("/wms/line-stocks")
@RequiredArgsConstructor
public class WmsLineStockController {

    private final WmsLineStockService wmsLineStockService;

    @GetMapping
    @RequirePermission("wms:linestock:list")
    public ApiResponse<PageResult<WmsLineSideStock>> page(WmsLineStockQuery query) {
        return ApiResponse.success(wmsLineStockService.page(query));
    }

    @GetMapping("/by-line")
    @RequirePermission("wms:linestock:list")
    public ApiResponse<List<WmsLineSideStock>> listByLine(@RequestParam String lineCode) {
        return ApiResponse.success(wmsLineStockService.listByLine(lineCode));
    }

    @GetMapping("/{id}")
    @RequirePermission("wms:linestock:list")
    public ApiResponse<WmsLineSideStock> detail(@PathVariable Long id) {
        return ApiResponse.success(wmsLineStockService.requireStock(id));
    }

    @PostMapping
    @RequirePermission("wms:linestock:operate")
    public ApiResponse<Long> create(@Valid @RequestBody WmsLineStockSaveRequest request) {
        return ApiResponse.success(wmsLineStockService.create(request));
    }

    @PutMapping("/{id}")
    @RequirePermission("wms:linestock:operate")
    public ApiResponse<Void> update(@PathVariable Long id,
                                    @Valid @RequestBody WmsLineStockSaveRequest request) {
        wmsLineStockService.update(id, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{id}")
    @RequirePermission("wms:linestock:operate")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        wmsLineStockService.delete(id);
        return ApiResponse.success();
    }

    @PostMapping("/{id}/issue")
    @RequirePermission("wms:linestock:operate")
    public ApiResponse<WmsLineSideStock> issue(@PathVariable Long id,
                                               @Valid @RequestBody WmsLineStockTxnRequest request) {
        return ApiResponse.success(wmsLineStockService.issue(id, request));
    }

    @PostMapping("/{id}/consume")
    @RequirePermission("wms:linestock:operate")
    public ApiResponse<WmsLineSideStock> consume(@PathVariable Long id,
                                                 @Valid @RequestBody WmsLineStockTxnRequest request) {
        return ApiResponse.success(wmsLineStockService.consume(id, request));
    }

    @PostMapping("/{id}/return")
    @RequirePermission("wms:linestock:operate")
    public ApiResponse<WmsLineSideStock> returnStock(@PathVariable Long id,
                                                     @Valid @RequestBody WmsLineStockTxnRequest request) {
        return ApiResponse.success(wmsLineStockService.returnStock(id, request));
    }

    @PostMapping("/{id}/scrap")
    @RequirePermission("wms:linestock:operate")
    public ApiResponse<WmsLineSideStock> scrap(@PathVariable Long id,
                                               @Valid @RequestBody WmsLineStockTxnRequest request) {
        return ApiResponse.success(wmsLineStockService.scrap(id, request));
    }

    @PostMapping("/{id}/adjust")
    @RequirePermission("wms:linestock:operate")
    public ApiResponse<WmsLineSideStock> adjust(@PathVariable Long id,
                                                @Valid @RequestBody WmsLineStockTxnRequest request) {
        return ApiResponse.success(wmsLineStockService.adjust(id, request));
    }
}
