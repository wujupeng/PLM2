package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.WmsLocationQuery;
import com.huaweicloud.plm.system.dto.WmsLocationSaveRequest;
import com.huaweicloud.plm.system.entity.WmsStorageLocation;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.WmsLocationService;
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
 * 库位/货架主数据接口（N7，DEV-075）。
 */
@RestController
@RequestMapping("/wms/locations")
@RequiredArgsConstructor
public class WmsLocationController {

    private final WmsLocationService wmsLocationService;

    @GetMapping
    @RequirePermission("wms:location:list")
    public ApiResponse<PageResult<WmsStorageLocation>> page(WmsLocationQuery query) {
        return ApiResponse.success(wmsLocationService.page(query));
    }

    @GetMapping("/options")
    @RequirePermission("wms:location:list")
    public ApiResponse<List<WmsStorageLocation>> options(@RequestParam(required = false) String locationType) {
        return ApiResponse.success(wmsLocationService.options(locationType));
    }

    @GetMapping("/{id}")
    @RequirePermission("wms:location:list")
    public ApiResponse<WmsStorageLocation> detail(@PathVariable Long id) {
        return ApiResponse.success(wmsLocationService.requireLocation(id));
    }

    @PostMapping
    @RequirePermission("wms:location:save")
    public ApiResponse<Long> create(@Valid @RequestBody WmsLocationSaveRequest request) {
        return ApiResponse.success(wmsLocationService.create(request));
    }

    @PutMapping("/{id}")
    @RequirePermission("wms:location:save")
    public ApiResponse<Void> update(@PathVariable Long id,
                                    @Valid @RequestBody WmsLocationSaveRequest request) {
        wmsLocationService.update(id, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{id}")
    @RequirePermission("wms:location:delete")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        wmsLocationService.delete(id);
        return ApiResponse.success();
    }
}
