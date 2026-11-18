package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IntgPlmMesBatchQuery;
import com.huaweicloud.plm.system.dto.IntgPlmMesBatchSaveRequest;
import com.huaweicloud.plm.system.entity.IntgPlmMesBatch;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.IntgPlmMesBatchService;
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
 * 同步批次接口：PLM→MES 集成同步批次的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/intg/plm-mes/batches")
@RequiredArgsConstructor
public class IntgPlmMesBatchController {

    private final IntgPlmMesBatchService service;

    @GetMapping
    @RequirePermission("intg:plm-mes:batch:list")
    public ApiResponse<PageResult<IntgPlmMesBatch>> page(IntgPlmMesBatchQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("intg:plm-mes:batch:list")
    public ApiResponse<IntgPlmMesBatch> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("intg:plm-mes:batch:manage")
    public ApiResponse<Long> create(@Valid @RequestBody IntgPlmMesBatchSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("intg:plm-mes:batch:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody IntgPlmMesBatchSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("intg:plm-mes:batch:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
