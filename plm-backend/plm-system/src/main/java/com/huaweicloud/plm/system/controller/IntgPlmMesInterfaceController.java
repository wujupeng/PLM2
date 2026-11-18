package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IntgPlmMesInterfaceQuery;
import com.huaweicloud.plm.system.dto.IntgPlmMesInterfaceSaveRequest;
import com.huaweicloud.plm.system.entity.IntgPlmMesInterface;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.IntgPlmMesInterfaceService;
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
 * 集成接口定义接口：PLM→MES 集成接口配置的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/intg/plm-mes/interfaces")
@RequiredArgsConstructor
public class IntgPlmMesInterfaceController {

    private final IntgPlmMesInterfaceService service;

    @GetMapping
    @RequirePermission("intg:plm-mes:interface:list")
    public ApiResponse<PageResult<IntgPlmMesInterface>> page(IntgPlmMesInterfaceQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("intg:plm-mes:interface:list")
    public ApiResponse<IntgPlmMesInterface> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("intg:plm-mes:interface:manage")
    public ApiResponse<Long> create(@Valid @RequestBody IntgPlmMesInterfaceSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("intg:plm-mes:interface:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody IntgPlmMesInterfaceSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("intg:plm-mes:interface:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
