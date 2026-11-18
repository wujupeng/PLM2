package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ErpProcessRouteQuery;
import com.huaweicloud.plm.system.dto.ErpProcessRouteSaveRequest;
import com.huaweicloud.plm.system.entity.ErpProcessRoute;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ErpProcessRouteService;
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
 * 工艺路线接口（对应 G3-N7b ERP 工艺资源—工艺路线）：
 * 工艺路线的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/erp/process/routes")
@RequiredArgsConstructor
public class ErpProcessRouteController {

    private final ErpProcessRouteService service;

    @GetMapping
    @RequirePermission("erp:process:route:list")
    public ApiResponse<PageResult<ErpProcessRoute>> page(ErpProcessRouteQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("erp:process:route:list")
    public ApiResponse<ErpProcessRoute> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("erp:process:route:manage")
    public ApiResponse<Long> create(@Valid @RequestBody ErpProcessRouteSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("erp:process:route:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody ErpProcessRouteSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("erp:process:route:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
