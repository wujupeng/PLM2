package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IntgErpSrmCompensationQuery;
import com.huaweicloud.plm.system.dto.IntgErpSrmCompensationSaveRequest;
import com.huaweicloud.plm.system.entity.IntgErpSrmCompensation;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.IntgErpSrmCompensationService;
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
@RequestMapping("/intg/erp-srm/compensations")
@RequiredArgsConstructor
public class IntgErpSrmCompensationController {

    private final IntgErpSrmCompensationService service;

    @GetMapping
    @RequirePermission("intg:erp-srm:compensation:list")
    public ApiResponse<PageResult<IntgErpSrmCompensation>> page(IntgErpSrmCompensationQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("intg:erp-srm:compensation:list")
    public ApiResponse<IntgErpSrmCompensation> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("intg:erp-srm:compensation:manage")
    public ApiResponse<Long> create(@Valid @RequestBody IntgErpSrmCompensationSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("intg:erp-srm:compensation:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody IntgErpSrmCompensationSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("intg:erp-srm:compensation:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
