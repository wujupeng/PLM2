package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MigInventoryInterfaceQuery;
import com.huaweicloud.plm.system.dto.MigInventoryInterfaceSaveRequest;
import com.huaweicloud.plm.system.entity.MigInventoryInterface;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MigInventoryInterfaceService;
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
 * 集成接口定义接口：库存迁移集成接口配置的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/mig/inventory/interfaces")
@RequiredArgsConstructor
public class MigInventoryInterfaceController {

    private final MigInventoryInterfaceService service;

    @GetMapping
    @RequirePermission("mig:inventory:interface:list")
    public ApiResponse<PageResult<MigInventoryInterface>> page(MigInventoryInterfaceQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("mig:inventory:interface:list")
    public ApiResponse<MigInventoryInterface> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("mig:inventory:interface:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MigInventoryInterfaceSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("mig:inventory:interface:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody MigInventoryInterfaceSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("mig:inventory:interface:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
