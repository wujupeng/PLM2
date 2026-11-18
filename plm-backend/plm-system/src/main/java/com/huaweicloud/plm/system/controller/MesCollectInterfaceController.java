package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MesCollectInterfaceQuery;
import com.huaweicloud.plm.system.dto.MesCollectInterfaceSaveRequest;
import com.huaweicloud.plm.system.entity.MesCollectInterface;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MesCollectInterfaceService;
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
 * PLC/网关采集接口：采集接口登记、分页查询与删除。
 */
@RestController
@RequestMapping("/mes/collect/interfaces")
@RequiredArgsConstructor
public class MesCollectInterfaceController {

    private final MesCollectInterfaceService service;

    @GetMapping
    @RequirePermission("mes:collect:interface:list")
    public ApiResponse<PageResult<MesCollectInterface>> page(MesCollectInterfaceQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("mes:collect:interface:list")
    public ApiResponse<MesCollectInterface> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("mes:collect:interface:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MesCollectInterfaceSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("mes:collect:interface:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody MesCollectInterfaceSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("mes:collect:interface:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
