package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MesTraceCodeQuery;
import com.huaweicloud.plm.system.dto.MesTraceCodeSaveRequest;
import com.huaweicloud.plm.system.entity.MesTraceCode;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MesTraceCodeService;
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
 * 追溯码接口：登记、分页查询与删除。
 */
@RestController
@RequestMapping("/mes/trace/codes")
@RequiredArgsConstructor
public class MesTraceCodeController {

    private final MesTraceCodeService service;

    @GetMapping
    @RequirePermission("mes:trace:code:list")
    public ApiResponse<PageResult<MesTraceCode>> page(MesTraceCodeQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("mes:trace:code:list")
    public ApiResponse<MesTraceCode> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("mes:trace:code:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MesTraceCodeSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("mes:trace:code:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody MesTraceCodeSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("mes:trace:code:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
