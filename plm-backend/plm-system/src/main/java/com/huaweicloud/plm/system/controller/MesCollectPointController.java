package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MesCollectPointQuery;
import com.huaweicloud.plm.system.dto.MesCollectPointSaveRequest;
import com.huaweicloud.plm.system.entity.MesCollectPoint;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MesCollectPointService;
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
 * 采集数据点接口：数据点登记、分页查询与删除。
 */
@RestController
@RequestMapping("/mes/collect/points")
@RequiredArgsConstructor
public class MesCollectPointController {

    private final MesCollectPointService service;

    @GetMapping
    @RequirePermission("mes:collect:point:list")
    public ApiResponse<PageResult<MesCollectPoint>> page(MesCollectPointQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("mes:collect:point:list")
    public ApiResponse<MesCollectPoint> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("mes:collect:point:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MesCollectPointSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("mes:collect:point:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody MesCollectPointSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("mes:collect:point:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
