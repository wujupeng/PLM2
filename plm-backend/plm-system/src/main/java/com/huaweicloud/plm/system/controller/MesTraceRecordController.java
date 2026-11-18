package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MesTraceRecordQuery;
import com.huaweicloud.plm.system.dto.MesTraceRecordSaveRequest;
import com.huaweicloud.plm.system.entity.MesTraceRecord;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MesTraceRecordService;
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
 * 追溯记录接口：登记、分页查询与删除。
 */
@RestController
@RequestMapping("/mes/trace/records")
@RequiredArgsConstructor
public class MesTraceRecordController {

    private final MesTraceRecordService service;

    @GetMapping
    @RequirePermission("mes:trace:record:list")
    public ApiResponse<PageResult<MesTraceRecord>> page(MesTraceRecordQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("mes:trace:record:list")
    public ApiResponse<MesTraceRecord> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("mes:trace:record:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MesTraceRecordSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("mes:trace:record:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody MesTraceRecordSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("mes:trace:record:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
