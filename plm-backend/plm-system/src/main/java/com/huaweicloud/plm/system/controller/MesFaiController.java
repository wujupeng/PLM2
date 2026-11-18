package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MesFaiQuery;
import com.huaweicloud.plm.system.dto.MesFaiSaveRequest;
import com.huaweicloud.plm.system.entity.MesFai;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MesFaiService;
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
 * 首件确认接口：首件确认登记、分页查询与删除。
 */
@RestController
@RequestMapping("/mes/craft/fais")
@RequiredArgsConstructor
public class MesFaiController {

    private final MesFaiService service;

    @GetMapping
    @RequirePermission("mes:craft:fai:list")
    public ApiResponse<PageResult<MesFai>> page(MesFaiQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("mes:craft:fai:list")
    public ApiResponse<MesFai> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("mes:craft:fai:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MesFaiSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("mes:craft:fai:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody MesFaiSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("mes:craft:fai:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
