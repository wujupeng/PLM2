package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.WmsKittingCheckQuery;
import com.huaweicloud.plm.system.dto.WmsKittingCheckSaveRequest;
import com.huaweicloud.plm.system.entity.WmsKittingCheck;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.WmsKittingCheckService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 齐套检查接口：齐套检查登记、分页查询与删除。
 */
@RestController
@RequestMapping("/wms/pick/kittings")
@RequiredArgsConstructor
public class WmsKittingCheckController {

    private final WmsKittingCheckService service;

    @GetMapping
    @RequirePermission("wms:pick:kitting:list")
    public ApiResponse<PageResult<WmsKittingCheck>> page(WmsKittingCheckQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("wms:pick:kitting:list")
    public ApiResponse<WmsKittingCheck> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("wms:pick:kitting:manage")
    public ApiResponse<Long> create(@Valid @RequestBody WmsKittingCheckSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("wms:pick:kitting:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody WmsKittingCheckSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("wms:pick:kitting:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
