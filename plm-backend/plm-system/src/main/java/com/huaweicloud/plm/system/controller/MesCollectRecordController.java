package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MesCollectRecordQuery;
import com.huaweicloud.plm.system.dto.MesCollectRecordSaveRequest;
import com.huaweicloud.plm.system.entity.MesCollectRecord;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MesCollectRecordService;
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
 * 采集数据记录接口：记录登记、分页查询与删除。
 */
@RestController
@RequestMapping("/mes/collect/records")
@RequiredArgsConstructor
public class MesCollectRecordController {

    private final MesCollectRecordService service;

    @GetMapping
    @RequirePermission("mes:collect:record:list")
    public ApiResponse<PageResult<MesCollectRecord>> page(MesCollectRecordQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("mes:collect:record:list")
    public ApiResponse<MesCollectRecord> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("mes:collect:record:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MesCollectRecordSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("mes:collect:record:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody MesCollectRecordSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("mes:collect:record:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
