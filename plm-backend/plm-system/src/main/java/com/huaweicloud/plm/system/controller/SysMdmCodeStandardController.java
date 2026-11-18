package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.SysMdmCodeStandardQuery;
import com.huaweicloud.plm.system.dto.SysMdmCodeStandardSaveRequest;
import com.huaweicloud.plm.system.entity.SysMdmCodeStandard;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysMdmCodeStandardService;
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
 * 编码标准接口（G1-N8 公共平台底座 WBS T007 主数据平台）：
 * 编码标准登记、分页查询与删除。
 */
@RestController
@RequestMapping("/platform/mdm/code-standards")
@RequiredArgsConstructor
public class SysMdmCodeStandardController {

    private final SysMdmCodeStandardService service;

    @GetMapping
    @RequirePermission("platform:mdm:codestandard:list")
    public ApiResponse<PageResult<SysMdmCodeStandard>> page(SysMdmCodeStandardQuery query) {
        return ApiResponse.success(service.pageCodeStandards(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:mdm:codestandard:list")
    public ApiResponse<SysMdmCodeStandard> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:mdm:codestandard:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SysMdmCodeStandardSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:mdm:codestandard:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SysMdmCodeStandardSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:mdm:codestandard:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
