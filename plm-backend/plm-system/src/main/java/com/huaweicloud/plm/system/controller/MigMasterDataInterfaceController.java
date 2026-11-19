package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MigMasterDataInterfaceQuery;
import com.huaweicloud.plm.system.dto.MigMasterDataInterfaceSaveRequest;
import com.huaweicloud.plm.system.entity.MigMasterDataInterface;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MigMasterDataInterfaceService;
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
 * 集成接口定义接口：主数据迁移集成接口配置的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/mig/master-data/interfaces")
@RequiredArgsConstructor
public class MigMasterDataInterfaceController {

    private final MigMasterDataInterfaceService service;

    @GetMapping
    @RequirePermission("mig:master-data:interface:list")
    public ApiResponse<PageResult<MigMasterDataInterface>> page(MigMasterDataInterfaceQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("mig:master-data:interface:list")
    public ApiResponse<MigMasterDataInterface> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("mig:master-data:interface:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MigMasterDataInterfaceSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("mig:master-data:interface:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody MigMasterDataInterfaceSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("mig:master-data:interface:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
