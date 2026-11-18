package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.WmsDeliveryCreateRequest;
import com.huaweicloud.plm.system.dto.WmsDeliveryExecuteRequest;
import com.huaweicloud.plm.system.dto.WmsDeliveryQuery;
import com.huaweicloud.plm.system.entity.WmsDeliveryTask;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.WmsDeliveryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 物料配送任务接口（N7，DEV-077）。
 */
@RestController
@RequestMapping("/wms/deliveries")
@RequiredArgsConstructor
public class WmsDeliveryController {

    private final WmsDeliveryService wmsDeliveryService;

    @GetMapping
    @RequirePermission("wms:delivery:list")
    public ApiResponse<PageResult<WmsDeliveryTask>> page(WmsDeliveryQuery query) {
        return ApiResponse.success(wmsDeliveryService.page(query));
    }

    @GetMapping("/{taskNo}")
    @RequirePermission("wms:delivery:list")
    public ApiResponse<WmsDeliveryTask> detail(@PathVariable String taskNo) {
        return ApiResponse.success(wmsDeliveryService.requireTask(taskNo));
    }

    @PostMapping
    @RequirePermission("wms:delivery:execute")
    public ApiResponse<Long> create(@Valid @RequestBody WmsDeliveryCreateRequest request) {
        return ApiResponse.success(wmsDeliveryService.create(request));
    }

    @PostMapping("/{taskNo}/accept")
    @RequirePermission("wms:delivery:execute")
    public ApiResponse<Void> accept(@PathVariable String taskNo,
                                    @RequestBody(required = false) WmsDeliveryExecuteRequest request) {
        wmsDeliveryService.accept(taskNo, request);
        return ApiResponse.success();
    }

    @PostMapping("/{taskNo}/deliver")
    @RequirePermission("wms:delivery:execute")
    public ApiResponse<Void> deliver(@PathVariable String taskNo,
                                     @RequestBody(required = false) WmsDeliveryExecuteRequest request) {
        wmsDeliveryService.deliver(taskNo, request);
        return ApiResponse.success();
    }

    @PostMapping("/{taskNo}/sign")
    @RequirePermission("wms:delivery:execute")
    public ApiResponse<Void> sign(@PathVariable String taskNo,
                                  @RequestBody(required = false) WmsDeliveryExecuteRequest request) {
        wmsDeliveryService.sign(taskNo, request);
        return ApiResponse.success();
    }

    @PostMapping("/{taskNo}/cancel")
    @RequirePermission("wms:delivery:execute")
    public ApiResponse<Void> cancel(@PathVariable String taskNo,
                                    @RequestBody(required = false) WmsDeliveryExecuteRequest request) {
        wmsDeliveryService.cancel(taskNo, request);
        return ApiResponse.success();
    }
}
