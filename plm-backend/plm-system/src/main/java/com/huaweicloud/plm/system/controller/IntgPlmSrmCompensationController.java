package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IntgPlmSrmCompensationQuery;
import com.huaweicloud.plm.system.dto.IntgPlmSrmCompensationSaveRequest;
import com.huaweicloud.plm.system.entity.IntgPlmSrmCompensation;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.IntgPlmSrmCompensationService;
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
 * SRM 异常补偿接口：PLM→SRM 集成异常补偿的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/intg/plm-srm/compensations")
@RequiredArgsConstructor
public class IntgPlmSrmCompensationController {

    private final IntgPlmSrmCompensationService service;

    @GetMapping
    @RequirePermission("intg:plm-srm:compensation:list")
    public ApiResponse<PageResult<IntgPlmSrmCompensation>> page(IntgPlmSrmCompensationQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("intg:plm-srm:compensation:list")
    public ApiResponse<IntgPlmSrmCompensation> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("intg:plm-srm:compensation:manage")
    public ApiResponse<Long> create(@Valid @RequestBody IntgPlmSrmCompensationSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("intg:plm-srm:compensation:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody IntgPlmSrmCompensationSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("intg:plm-srm:compensation:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
