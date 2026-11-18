package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IntgPlmMesCompensationQuery;
import com.huaweicloud.plm.system.dto.IntgPlmMesCompensationSaveRequest;
import com.huaweicloud.plm.system.entity.IntgPlmMesCompensation;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.IntgPlmMesCompensationService;
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
 * MES 异常补偿接口：PLM→MES 集成异常补偿的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/intg/plm-mes/compensations")
@RequiredArgsConstructor
public class IntgPlmMesCompensationController {

    private final IntgPlmMesCompensationService service;

    @GetMapping
    @RequirePermission("intg:plm-mes:compensation:list")
    public ApiResponse<PageResult<IntgPlmMesCompensation>> page(IntgPlmMesCompensationQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("intg:plm-mes:compensation:list")
    public ApiResponse<IntgPlmMesCompensation> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("intg:plm-mes:compensation:manage")
    public ApiResponse<Long> create(@Valid @RequestBody IntgPlmMesCompensationSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("intg:plm-mes:compensation:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody IntgPlmMesCompensationSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("intg:plm-mes:compensation:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
