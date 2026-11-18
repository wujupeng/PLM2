package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MesSopQuery;
import com.huaweicloud.plm.system.dto.MesSopSaveRequest;
import com.huaweicloud.plm.system.entity.MesSop;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MesSopService;
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
 * SOP作业指导书接口：SOP登记、分页查询与删除。
 */
@RestController
@RequestMapping("/mes/craft/sops")
@RequiredArgsConstructor
public class MesSopController {

    private final MesSopService service;

    @GetMapping
    @RequirePermission("mes:craft:sop:list")
    public ApiResponse<PageResult<MesSop>> page(MesSopQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("mes:craft:sop:list")
    public ApiResponse<MesSop> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("mes:craft:sop:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MesSopSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("mes:craft:sop:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody MesSopSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("mes:craft:sop:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
