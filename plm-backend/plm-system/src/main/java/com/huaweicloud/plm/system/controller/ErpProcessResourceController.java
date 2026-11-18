package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ErpProcessResourceQuery;
import com.huaweicloud.plm.system.dto.ErpProcessResourceSaveRequest;
import com.huaweicloud.plm.system.entity.ErpProcessResource;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ErpProcessResourceService;
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
 * 资源资料接口（对应 G3-N7b ERP 工艺资源）：
 * 资源资料登记、分页查询与删除。
 */
@RestController
@RequestMapping("/erp/process/resources")
@RequiredArgsConstructor
public class ErpProcessResourceController {

    private final ErpProcessResourceService service;

    @GetMapping
    @RequirePermission("erp:process:resource:list")
    public ApiResponse<PageResult<ErpProcessResource>> page(ErpProcessResourceQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("erp:process:resource:list")
    public ApiResponse<ErpProcessResource> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("erp:process:resource:manage")
    public ApiResponse<Long> create(@Valid @RequestBody ErpProcessResourceSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("erp:process:resource:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody ErpProcessResourceSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("erp:process:resource:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
