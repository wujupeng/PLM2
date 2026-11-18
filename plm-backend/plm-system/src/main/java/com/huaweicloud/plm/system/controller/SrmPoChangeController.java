package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.SrmPoChangeQuery;
import com.huaweicloud.plm.system.dto.SrmPoChangeSaveRequest;
import com.huaweicloud.plm.system.entity.SrmPoChange;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SrmPoChangeService;
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
 * 变更确认接口（对应变更确认）：
 * 变更确认登记、分页查询与删除。
 */
@RestController
@RequestMapping("/srm/changes")
@RequiredArgsConstructor
public class SrmPoChangeController {

    private final SrmPoChangeService service;

    @GetMapping
    @RequirePermission("srm:collab:change:list")
    public ApiResponse<PageResult<SrmPoChange>> page(SrmPoChangeQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("srm:collab:change:list")
    public ApiResponse<SrmPoChange> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("srm:collab:change:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SrmPoChangeSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("srm:collab:change:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SrmPoChangeSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("srm:collab:change:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
