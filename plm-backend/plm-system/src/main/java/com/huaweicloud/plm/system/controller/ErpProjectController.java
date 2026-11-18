package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ErpProjectQuery;
import com.huaweicloud.plm.system.dto.ErpProjectSaveRequest;
import com.huaweicloud.plm.system.entity.ErpProject;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ErpProjectService;
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
 * 项目档案接口（G3-N1 ERP 基础资料 WBS T021）：
 * 项目档案登记、分页查询与删除。
 */
@RestController
@RequestMapping("/erp/base/projects")
@RequiredArgsConstructor
public class ErpProjectController {

    private final ErpProjectService service;

    @GetMapping
    @RequirePermission("erp:base:project:list")
    public ApiResponse<PageResult<ErpProject>> page(ErpProjectQuery query) {
        return ApiResponse.success(service.pageProjects(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("erp:base:project:list")
    public ApiResponse<ErpProject> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("erp:base:project:manage")
    public ApiResponse<Long> create(@Valid @RequestBody ErpProjectSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("erp:base:project:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody ErpProjectSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("erp:base:project:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
