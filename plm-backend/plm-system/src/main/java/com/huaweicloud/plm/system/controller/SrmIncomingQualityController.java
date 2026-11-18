package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.SrmIncomingQualityQuery;
import com.huaweicloud.plm.system.dto.SrmIncomingQualitySaveRequest;
import com.huaweicloud.plm.system.entity.SrmIncomingQuality;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SrmIncomingQualityService;
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
 * 来料质量接口（对应来料质量）：
 * 来料检验单登记、分页查询与删除。
 */
@RestController
@RequestMapping("/srm/iqc")
@RequiredArgsConstructor
public class SrmIncomingQualityController {

    private final SrmIncomingQualityService service;

    @GetMapping
    @RequirePermission("srm:quality:iqc:list")
    public ApiResponse<PageResult<SrmIncomingQuality>> page(SrmIncomingQualityQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("srm:quality:iqc:list")
    public ApiResponse<SrmIncomingQuality> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("srm:quality:iqc:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SrmIncomingQualitySaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("srm:quality:iqc:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SrmIncomingQualitySaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("srm:quality:iqc:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
