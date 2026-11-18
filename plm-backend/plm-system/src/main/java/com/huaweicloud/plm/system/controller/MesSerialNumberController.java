package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MesSerialNumberQuery;
import com.huaweicloud.plm.system.dto.MesSerialNumberSaveRequest;
import com.huaweicloud.plm.system.entity.MesSerialNumber;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MesSerialNumberService;
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
 * 序列号台账接口：登记、分页查询与删除。
 */
@RestController
@RequestMapping("/mes/trace/serials")
@RequiredArgsConstructor
public class MesSerialNumberController {

    private final MesSerialNumberService service;

    @GetMapping
    @RequirePermission("mes:trace:serial:list")
    public ApiResponse<PageResult<MesSerialNumber>> page(MesSerialNumberQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("mes:trace:serial:list")
    public ApiResponse<MesSerialNumber> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("mes:trace:serial:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MesSerialNumberSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("mes:trace:serial:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody MesSerialNumberSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("mes:trace:serial:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
