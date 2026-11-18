package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MesTraceLinkQuery;
import com.huaweicloud.plm.system.dto.MesTraceLinkSaveRequest;
import com.huaweicloud.plm.system.entity.MesTraceLink;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MesTraceLinkService;
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
 * 追溯关联接口：登记、分页查询与删除。
 */
@RestController
@RequestMapping("/mes/trace/links")
@RequiredArgsConstructor
public class MesTraceLinkController {

    private final MesTraceLinkService service;

    @GetMapping
    @RequirePermission("mes:trace:link:list")
    public ApiResponse<PageResult<MesTraceLink>> page(MesTraceLinkQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("mes:trace:link:list")
    public ApiResponse<MesTraceLink> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("mes:trace:link:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MesTraceLinkSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("mes:trace:link:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody MesTraceLinkSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("mes:trace:link:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
