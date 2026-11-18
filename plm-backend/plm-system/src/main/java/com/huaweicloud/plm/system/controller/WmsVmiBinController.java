package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.WmsVmiBinQuery;
import com.huaweicloud.plm.system.dto.WmsVmiBinSaveRequest;
import com.huaweicloud.plm.system.entity.WmsVmiBin;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.WmsVmiBinService;
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
 * VMI 库位接口：VMI 库位登记、分页查询与删除。
 */
@RestController
@RequestMapping("/wms/vmi/bins")
@RequiredArgsConstructor
public class WmsVmiBinController {

    private final WmsVmiBinService service;

    @GetMapping
    @RequirePermission("wms:vmi:bin:list")
    public ApiResponse<PageResult<WmsVmiBin>> page(WmsVmiBinQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("wms:vmi:bin:list")
    public ApiResponse<WmsVmiBin> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("wms:vmi:bin:manage")
    public ApiResponse<Long> create(@Valid @RequestBody WmsVmiBinSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("wms:vmi:bin:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody WmsVmiBinSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("wms:vmi:bin:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
