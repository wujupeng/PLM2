package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MigOpenBusinessReceiptQuery;
import com.huaweicloud.plm.system.dto.MigOpenBusinessReceiptSaveRequest;
import com.huaweicloud.plm.system.entity.MigOpenBusinessReceipt;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MigOpenBusinessReceiptService;
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
 * 未结业务迁移接收回执接口：接收系统对未结业务迁移推送对象的校验回执的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/mig/open-business/receipts")
@RequiredArgsConstructor
public class MigOpenBusinessReceiptController {

    private final MigOpenBusinessReceiptService service;

    @GetMapping
    @RequirePermission("mig:open-business:receipt:list")
    public ApiResponse<PageResult<MigOpenBusinessReceipt>> page(MigOpenBusinessReceiptQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("mig:open-business:receipt:list")
    public ApiResponse<MigOpenBusinessReceipt> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("mig:open-business:receipt:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MigOpenBusinessReceiptSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("mig:open-business:receipt:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody MigOpenBusinessReceiptSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("mig:open-business:receipt:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
