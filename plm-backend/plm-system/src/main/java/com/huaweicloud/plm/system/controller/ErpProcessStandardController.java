package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ErpProcessStandardQuery;
import com.huaweicloud.plm.system.dto.ErpProcessStandardSaveRequest;
import com.huaweicloud.plm.system.entity.ErpProcessStandard;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ErpProcessStandardService;
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
 * 标准工艺接口（对应 G3-N7b ERP 工艺资源）：
 * 标准工艺登记、分页查询与删除。
 */
@RestController
@RequestMapping("/erp/process/standards")
@RequiredArgsConstructor
public class ErpProcessStandardController {

    private final ErpProcessStandardService service;

    @GetMapping
    @RequirePermission("erp:process:standard:list")
    public ApiResponse<PageResult<ErpProcessStandard>> page(ErpProcessStandardQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("erp:process:standard:list")
    public ApiResponse<ErpProcessStandard> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("erp:process:standard:manage")
    public ApiResponse<Long> create(@Valid @RequestBody ErpProcessStandardSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("erp:process:standard:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody ErpProcessStandardSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("erp:process:standard:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
