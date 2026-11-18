package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.WmsInventoryTxnQuery;
import com.huaweicloud.plm.system.entity.WmsInventoryTxn;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.WmsInventoryTxnService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 库存流水查询接口（N7，DEV-081）。
 */
@RestController
@RequestMapping("/wms/inventory-txns")
@RequiredArgsConstructor
public class WmsInventoryTxnController {

    private final WmsInventoryTxnService wmsInventoryTxnService;

    @GetMapping
    @RequirePermission("wms:linestock:list")
    public ApiResponse<PageResult<WmsInventoryTxn>> page(WmsInventoryTxnQuery query) {
        return ApiResponse.success(wmsInventoryTxnService.page(query));
    }
}
