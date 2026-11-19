package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MigOpenBusinessMappingQuery;
import com.huaweicloud.plm.system.dto.MigOpenBusinessMappingSaveRequest;
import com.huaweicloud.plm.system.entity.MigOpenBusinessMapping;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MigOpenBusinessMappingService;
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
 * 字段映射接口：未结业务迁移集成字段映射的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/mig/open-business/mappings")
@RequiredArgsConstructor
public class MigOpenBusinessMappingController {

    private final MigOpenBusinessMappingService service;

    @GetMapping
    @RequirePermission("mig:open-business:mapping:list")
    public ApiResponse<PageResult<MigOpenBusinessMapping>> page(MigOpenBusinessMappingQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("mig:open-business:mapping:list")
    public ApiResponse<MigOpenBusinessMapping> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("mig:open-business:mapping:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MigOpenBusinessMappingSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("mig:open-business:mapping:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody MigOpenBusinessMappingSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("mig:open-business:mapping:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
