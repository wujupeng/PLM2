package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MesToolLifeQuery;
import com.huaweicloud.plm.system.dto.MesToolLifeSaveRequest;
import com.huaweicloud.plm.system.entity.MesToolLife;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MesToolLifeService;
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
 * 工装寿命接口：工装寿命登记、分页查询与删除。
 */
@RestController
@RequestMapping("/mes/equipment/tools")
@RequiredArgsConstructor
public class MesToolLifeController {

    private final MesToolLifeService service;

    @GetMapping
    @RequirePermission("mes:tool:life:list")
    public ApiResponse<PageResult<MesToolLife>> page(MesToolLifeQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("mes:tool:life:list")
    public ApiResponse<MesToolLife> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("mes:tool:life:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MesToolLifeSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("mes:tool:life:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody MesToolLifeSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("mes:tool:life:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
