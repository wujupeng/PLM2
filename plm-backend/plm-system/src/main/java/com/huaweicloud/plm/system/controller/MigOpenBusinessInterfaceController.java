package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MigOpenBusinessInterfaceQuery;
import com.huaweicloud.plm.system.dto.MigOpenBusinessInterfaceSaveRequest;
import com.huaweicloud.plm.system.entity.MigOpenBusinessInterface;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MigOpenBusinessInterfaceService;
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
 * 集成接口定义接口：未结业务迁移集成接口配置的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/mig/open-business/interfaces")
@RequiredArgsConstructor
public class MigOpenBusinessInterfaceController {

    private final MigOpenBusinessInterfaceService service;

    @GetMapping
    @RequirePermission("mig:open-business:interface:list")
    public ApiResponse<PageResult<MigOpenBusinessInterface>> page(MigOpenBusinessInterfaceQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("mig:open-business:interface:list")
    public ApiResponse<MigOpenBusinessInterface> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("mig:open-business:interface:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MigOpenBusinessInterfaceSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("mig:open-business:interface:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody MigOpenBusinessInterfaceSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("mig:open-business:interface:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
