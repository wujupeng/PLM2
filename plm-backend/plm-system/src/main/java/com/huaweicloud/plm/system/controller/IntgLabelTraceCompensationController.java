package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IntgLabelTraceCompensationQuery;
import com.huaweicloud.plm.system.dto.IntgLabelTraceCompensationSaveRequest;
import com.huaweicloud.plm.system.entity.IntgLabelTraceCompensation;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.IntgLabelTraceCompensationService;
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
 * 标签追溯异常补偿接口：标签追溯集成异常补偿的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/intg/label-trace/compensations")
@RequiredArgsConstructor
public class IntgLabelTraceCompensationController {

    private final IntgLabelTraceCompensationService service;

    @GetMapping
    @RequirePermission("intg:label-trace:compensation:list")
    public ApiResponse<PageResult<IntgLabelTraceCompensation>> page(IntgLabelTraceCompensationQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("intg:label-trace:compensation:list")
    public ApiResponse<IntgLabelTraceCompensation> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("intg:label-trace:compensation:manage")
    public ApiResponse<Long> create(@Valid @RequestBody IntgLabelTraceCompensationSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("intg:label-trace:compensation:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody IntgLabelTraceCompensationSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("intg:label-trace:compensation:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
