package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MigBomCompensationQuery;
import com.huaweicloud.plm.system.dto.MigBomCompensationSaveRequest;
import com.huaweicloud.plm.system.entity.MigBomCompensation;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MigBomCompensationService;
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
 * BOM迁移异常补偿接口：BOM迁移集成异常补偿的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/mig/bom/compensations")
@RequiredArgsConstructor
public class MigBomCompensationController {

    private final MigBomCompensationService service;

    @GetMapping
    @RequirePermission("mig:bom:compensation:list")
    public ApiResponse<PageResult<MigBomCompensation>> page(MigBomCompensationQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("mig:bom:compensation:list")
    public ApiResponse<MigBomCompensation> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("mig:bom:compensation:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MigBomCompensationSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("mig:bom:compensation:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody MigBomCompensationSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("mig:bom:compensation:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
