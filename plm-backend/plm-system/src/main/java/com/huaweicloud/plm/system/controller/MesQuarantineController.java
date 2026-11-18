package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MesQuarantineQuery;
import com.huaweicloud.plm.system.dto.MesQuarantineSaveRequest;
import com.huaweicloud.plm.system.entity.MesQuarantine;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MesQuarantineService;
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
 * 隔离接口：隔离登记、分页查询与删除。
 */
@RestController
@RequestMapping("/mes/quality/quarantines")
@RequiredArgsConstructor
public class MesQuarantineController {

    private final MesQuarantineService service;

    @GetMapping
    @RequirePermission("mes:quality:quarantine:list")
    public ApiResponse<PageResult<MesQuarantine>> page(MesQuarantineQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("mes:quality:quarantine:list")
    public ApiResponse<MesQuarantine> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("mes:quality:quarantine:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MesQuarantineSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("mes:quality:quarantine:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody MesQuarantineSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("mes:quality:quarantine:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
