package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MigBomInterfaceQuery;
import com.huaweicloud.plm.system.dto.MigBomInterfaceSaveRequest;
import com.huaweicloud.plm.system.entity.MigBomInterface;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MigBomInterfaceService;
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
 * 集成接口定义接口：BOM迁移集成接口配置的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/mig/bom/interfaces")
@RequiredArgsConstructor
public class MigBomInterfaceController {

    private final MigBomInterfaceService service;

    @GetMapping
    @RequirePermission("mig:bom:interface:list")
    public ApiResponse<PageResult<MigBomInterface>> page(MigBomInterfaceQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("mig:bom:interface:list")
    public ApiResponse<MigBomInterface> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("mig:bom:interface:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MigBomInterfaceSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("mig:bom:interface:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody MigBomInterfaceSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("mig:bom:interface:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
