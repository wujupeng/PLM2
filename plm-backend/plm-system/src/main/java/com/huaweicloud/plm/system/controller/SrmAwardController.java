package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.SrmAwardQuery;
import com.huaweicloud.plm.system.dto.SrmAwardSaveRequest;
import com.huaweicloud.plm.system.entity.SrmAward;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SrmAwardService;
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
 * 定点定标接口（对应定点定标单）：
 * 定点定标单登记、分页查询与删除。
 */
@RestController
@RequestMapping("/srm/awards")
@RequiredArgsConstructor
public class SrmAwardController {

    private final SrmAwardService service;

    @GetMapping
    @RequirePermission("srm:sourcing:award:list")
    public ApiResponse<PageResult<SrmAward>> page(SrmAwardQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("srm:sourcing:award:list")
    public ApiResponse<SrmAward> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("srm:sourcing:award:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SrmAwardSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("srm:sourcing:award:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SrmAwardSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("srm:sourcing:award:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
