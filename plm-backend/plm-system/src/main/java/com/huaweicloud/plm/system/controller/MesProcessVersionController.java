package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MesProcessVersionQuery;
import com.huaweicloud.plm.system.dto.MesProcessVersionSaveRequest;
import com.huaweicloud.plm.system.entity.MesProcessVersion;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MesProcessVersionService;
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
 * MES 工艺版本接口：工艺版本登记、分页查询与删除。
 */
@RestController
@RequestMapping("/mes/craft/versions")
@RequiredArgsConstructor
public class MesProcessVersionController {

    private final MesProcessVersionService service;

    @GetMapping
    @RequirePermission("mes:craft:version:list")
    public ApiResponse<PageResult<MesProcessVersion>> page(MesProcessVersionQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("mes:craft:version:list")
    public ApiResponse<MesProcessVersion> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("mes:craft:version:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MesProcessVersionSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("mes:craft:version:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody MesProcessVersionSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("mes:craft:version:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
