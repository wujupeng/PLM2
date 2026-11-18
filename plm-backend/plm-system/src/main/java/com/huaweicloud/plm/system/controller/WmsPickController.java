package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.WmsPickQuery;
import com.huaweicloud.plm.system.dto.WmsPickVerifyRequest;
import com.huaweicloud.plm.system.entity.WmsPickRecord;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.WmsPickService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 扫码领料校验接口（N7，DEV-078/080）：FIFO、超期与防混料校验，阻断或预警并留痕。
 */
@RestController
@RequestMapping("/wms/picks")
@RequiredArgsConstructor
public class WmsPickController {

    private final WmsPickService wmsPickService;

    @GetMapping
    @RequirePermission("wms:pick:list")
    public ApiResponse<PageResult<WmsPickRecord>> page(WmsPickQuery query) {
        return ApiResponse.success(wmsPickService.page(query));
    }

    @GetMapping("/{pickNo}")
    @RequirePermission("wms:pick:list")
    public ApiResponse<WmsPickRecord> detail(@PathVariable String pickNo) {
        return ApiResponse.success(wmsPickService.requirePick(pickNo));
    }

    @PostMapping("/verify")
    @RequirePermission("wms:pick:verify")
    public ApiResponse<WmsPickRecord> verify(@Valid @RequestBody WmsPickVerifyRequest request) {
        return ApiResponse.success(wmsPickService.verify(request));
    }
}
