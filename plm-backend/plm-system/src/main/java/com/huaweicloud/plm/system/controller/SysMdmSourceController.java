package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.SysMdmSourceQuery;
import com.huaweicloud.plm.system.dto.SysMdmSourceSaveRequest;
import com.huaweicloud.plm.system.entity.SysMdmSource;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysMdmSourceService;
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
 * 权威源登记接口（G1-N8 公共平台底座 WBS T007 主数据平台）：
 * 权威源登记、分页查询与删除。
 */
@RestController
@RequestMapping("/platform/mdm/sources")
@RequiredArgsConstructor
public class SysMdmSourceController {

    private final SysMdmSourceService service;

    @GetMapping
    @RequirePermission("platform:mdm:source:list")
    public ApiResponse<PageResult<SysMdmSource>> page(SysMdmSourceQuery query) {
        return ApiResponse.success(service.pageSources(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:mdm:source:list")
    public ApiResponse<SysMdmSource> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:mdm:source:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SysMdmSourceSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:mdm:source:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SysMdmSourceSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:mdm:source:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
