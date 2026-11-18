package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MesMaterialReplenishQuery;
import com.huaweicloud.plm.system.dto.MesMaterialReplenishSaveRequest;
import com.huaweicloud.plm.system.entity.MesMaterialReplenish;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MesMaterialReplenishService;
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
 * 补料记录接口：补料任务登记、分页查询与删除。
 */
@RestController
@RequestMapping("/mes/report/replenishes")
@RequiredArgsConstructor
public class MesMaterialReplenishController {

    private final MesMaterialReplenishService service;

    @GetMapping
    @RequirePermission("mes:report:replenish:list")
    public ApiResponse<PageResult<MesMaterialReplenish>> page(MesMaterialReplenishQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("mes:report:replenish:list")
    public ApiResponse<MesMaterialReplenish> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("mes:report:replenish:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MesMaterialReplenishSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("mes:report:replenish:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody MesMaterialReplenishSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("mes:report:replenish:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
