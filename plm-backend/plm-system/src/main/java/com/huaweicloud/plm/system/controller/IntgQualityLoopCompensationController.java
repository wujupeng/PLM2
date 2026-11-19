package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IntgQualityLoopCompensationQuery;
import com.huaweicloud.plm.system.dto.IntgQualityLoopCompensationSaveRequest;
import com.huaweicloud.plm.system.entity.IntgQualityLoopCompensation;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.IntgQualityLoopCompensationService;
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
 * 质量闭环异常补偿接口：质量闭环集成异常补偿的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/intg/quality-loop/compensations")
@RequiredArgsConstructor
public class IntgQualityLoopCompensationController {

    private final IntgQualityLoopCompensationService service;

    @GetMapping
    @RequirePermission("intg:quality-loop:compensation:list")
    public ApiResponse<PageResult<IntgQualityLoopCompensation>> page(IntgQualityLoopCompensationQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("intg:quality-loop:compensation:list")
    public ApiResponse<IntgQualityLoopCompensation> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("intg:quality-loop:compensation:manage")
    public ApiResponse<Long> create(@Valid @RequestBody IntgQualityLoopCompensationSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("intg:quality-loop:compensation:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody IntgQualityLoopCompensationSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("intg:quality-loop:compensation:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
