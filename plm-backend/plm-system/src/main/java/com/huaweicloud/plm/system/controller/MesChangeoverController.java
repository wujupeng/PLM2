package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MesChangeoverQuery;
import com.huaweicloud.plm.system.dto.MesChangeoverSaveRequest;
import com.huaweicloud.plm.system.entity.MesChangeover;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MesChangeoverService;
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
 * 换线换型接口：换线换型任务登记、分页查询与删除。
 */
@RestController
@RequestMapping("/mes/craft/changeovers")
@RequiredArgsConstructor
public class MesChangeoverController {

    private final MesChangeoverService service;

    @GetMapping
    @RequirePermission("mes:craft:changeover:list")
    public ApiResponse<PageResult<MesChangeover>> page(MesChangeoverQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("mes:craft:changeover:list")
    public ApiResponse<MesChangeover> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("mes:craft:changeover:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MesChangeoverSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("mes:craft:changeover:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody MesChangeoverSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("mes:craft:changeover:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
