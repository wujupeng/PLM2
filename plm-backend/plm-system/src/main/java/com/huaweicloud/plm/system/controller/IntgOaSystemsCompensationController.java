package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IntgOaSystemsCompensationQuery;
import com.huaweicloud.plm.system.dto.IntgOaSystemsCompensationSaveRequest;
import com.huaweicloud.plm.system.entity.IntgOaSystemsCompensation;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.IntgOaSystemsCompensationService;
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
 * OA↔六系统异常补偿接口：OA↔六系统集成异常补偿的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/intg/oa-systems/compensations")
@RequiredArgsConstructor
public class IntgOaSystemsCompensationController {

    private final IntgOaSystemsCompensationService service;

    @GetMapping
    @RequirePermission("intg:oa-systems:compensation:list")
    public ApiResponse<PageResult<IntgOaSystemsCompensation>> page(IntgOaSystemsCompensationQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("intg:oa-systems:compensation:list")
    public ApiResponse<IntgOaSystemsCompensation> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("intg:oa-systems:compensation:manage")
    public ApiResponse<Long> create(@Valid @RequestBody IntgOaSystemsCompensationSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("intg:oa-systems:compensation:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody IntgOaSystemsCompensationSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("intg:oa-systems:compensation:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
