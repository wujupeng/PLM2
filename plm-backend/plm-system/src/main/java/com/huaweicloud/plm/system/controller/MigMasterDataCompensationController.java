package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MigMasterDataCompensationQuery;
import com.huaweicloud.plm.system.dto.MigMasterDataCompensationSaveRequest;
import com.huaweicloud.plm.system.entity.MigMasterDataCompensation;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MigMasterDataCompensationService;
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
 * 主数据迁移异常补偿接口：主数据迁移集成异常补偿的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/mig/master-data/compensations")
@RequiredArgsConstructor
public class MigMasterDataCompensationController {

    private final MigMasterDataCompensationService service;

    @GetMapping
    @RequirePermission("mig:master-data:compensation:list")
    public ApiResponse<PageResult<MigMasterDataCompensation>> page(MigMasterDataCompensationQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("mig:master-data:compensation:list")
    public ApiResponse<MigMasterDataCompensation> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("mig:master-data:compensation:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MigMasterDataCompensationSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("mig:master-data:compensation:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody MigMasterDataCompensationSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("mig:master-data:compensation:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
