package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.WmsOutboundWaveQuery;
import com.huaweicloud.plm.system.dto.WmsOutboundWaveSaveRequest;
import com.huaweicloud.plm.system.entity.WmsOutboundWave;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.WmsOutboundWaveService;
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
 * 出库波次单接口：波次任务登记、分页查询与删除。
 */
@RestController
@RequestMapping("/wms/outbound/waves")
@RequiredArgsConstructor
public class WmsOutboundWaveController {

    private final WmsOutboundWaveService service;

    @GetMapping
    @RequirePermission("wms:outbound:wave:list")
    public ApiResponse<PageResult<WmsOutboundWave>> page(WmsOutboundWaveQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("wms:outbound:wave:list")
    public ApiResponse<WmsOutboundWave> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("wms:outbound:wave:manage")
    public ApiResponse<Long> create(@Valid @RequestBody WmsOutboundWaveSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("wms:outbound:wave:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody WmsOutboundWaveSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("wms:outbound:wave:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
