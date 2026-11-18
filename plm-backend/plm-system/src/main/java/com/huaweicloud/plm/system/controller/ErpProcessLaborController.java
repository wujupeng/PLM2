package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ErpProcessLaborQuery;
import com.huaweicloud.plm.system.dto.ErpProcessLaborSaveRequest;
import com.huaweicloud.plm.system.entity.ErpProcessLabor;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ErpProcessLaborService;
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
 * 工艺资源—工时反馈接口（对应 G3-N7b ERP 工艺资源—工时反馈）：
 * 工时反馈登记、分页查询与删除。
 */
@RestController
@RequestMapping("/erp/process/labor-feedback")
@RequiredArgsConstructor
public class ErpProcessLaborController {

    private final ErpProcessLaborService service;

    @GetMapping
    @RequirePermission("erp:process:labor:list")
    public ApiResponse<PageResult<ErpProcessLabor>> page(ErpProcessLaborQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("erp:process:labor:list")
    public ApiResponse<ErpProcessLabor> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("erp:process:labor:manage")
    public ApiResponse<Long> create(@Valid @RequestBody ErpProcessLaborSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("erp:process:labor:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody ErpProcessLaborSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("erp:process:labor:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
