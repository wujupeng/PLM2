package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MigOpenBusinessReconcileQuery;
import com.huaweicloud.plm.system.dto.MigOpenBusinessReconcileSaveRequest;
import com.huaweicloud.plm.system.entity.MigOpenBusinessReconcile;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MigOpenBusinessReconcileService;
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
 * 未结业务迁移对账接口：未结业务迁移集成对象对账的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/mig/open-business/reconciles")
@RequiredArgsConstructor
public class MigOpenBusinessReconcileController {

    private final MigOpenBusinessReconcileService service;

    @GetMapping
    @RequirePermission("mig:open-business:reconcile:list")
    public ApiResponse<PageResult<MigOpenBusinessReconcile>> page(MigOpenBusinessReconcileQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("mig:open-business:reconcile:list")
    public ApiResponse<MigOpenBusinessReconcile> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("mig:open-business:reconcile:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MigOpenBusinessReconcileSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("mig:open-business:reconcile:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody MigOpenBusinessReconcileSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("mig:open-business:reconcile:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
