package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MigOpenBusinessBatchQuery;
import com.huaweicloud.plm.system.dto.MigOpenBusinessBatchSaveRequest;
import com.huaweicloud.plm.system.entity.MigOpenBusinessBatch;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MigOpenBusinessBatchService;
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
 * 同步批次接口：未结业务迁移集成同步批次的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/mig/open-business/batches")
@RequiredArgsConstructor
public class MigOpenBusinessBatchController {

    private final MigOpenBusinessBatchService service;

    @GetMapping
    @RequirePermission("mig:open-business:batch:list")
    public ApiResponse<PageResult<MigOpenBusinessBatch>> page(MigOpenBusinessBatchQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("mig:open-business:batch:list")
    public ApiResponse<MigOpenBusinessBatch> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("mig:open-business:batch:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MigOpenBusinessBatchSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("mig:open-business:batch:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody MigOpenBusinessBatchSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("mig:open-business:batch:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
