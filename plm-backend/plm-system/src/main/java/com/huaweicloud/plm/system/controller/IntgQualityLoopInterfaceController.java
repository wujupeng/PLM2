package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IntgQualityLoopInterfaceQuery;
import com.huaweicloud.plm.system.dto.IntgQualityLoopInterfaceSaveRequest;
import com.huaweicloud.plm.system.entity.IntgQualityLoopInterface;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.IntgQualityLoopInterfaceService;
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
 * 集成接口定义接口：质量闭环集成接口配置的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/intg/quality-loop/interfaces")
@RequiredArgsConstructor
public class IntgQualityLoopInterfaceController {

    private final IntgQualityLoopInterfaceService service;

    @GetMapping
    @RequirePermission("intg:quality-loop:interface:list")
    public ApiResponse<PageResult<IntgQualityLoopInterface>> page(IntgQualityLoopInterfaceQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("intg:quality-loop:interface:list")
    public ApiResponse<IntgQualityLoopInterface> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("intg:quality-loop:interface:manage")
    public ApiResponse<Long> create(@Valid @RequestBody IntgQualityLoopInterfaceSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("intg:quality-loop:interface:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody IntgQualityLoopInterfaceSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("intg:quality-loop:interface:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
