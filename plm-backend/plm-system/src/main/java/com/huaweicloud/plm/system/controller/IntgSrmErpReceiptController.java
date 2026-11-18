package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IntgSrmErpReceiptQuery;
import com.huaweicloud.plm.system.dto.IntgSrmErpReceiptSaveRequest;
import com.huaweicloud.plm.system.entity.IntgSrmErpReceipt;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.IntgSrmErpReceiptService;
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
 * SRM→ERP 接收回执接口：ERP 对 SRM 发布对象的校验回执的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/intg/srm-erp/receipts")
@RequiredArgsConstructor
public class IntgSrmErpReceiptController {

    private final IntgSrmErpReceiptService service;

    @GetMapping
    @RequirePermission("intg:srm-erp:receipt:list")
    public ApiResponse<PageResult<IntgSrmErpReceipt>> page(IntgSrmErpReceiptQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("intg:srm-erp:receipt:list")
    public ApiResponse<IntgSrmErpReceipt> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("intg:srm-erp:receipt:manage")
    public ApiResponse<Long> create(@Valid @RequestBody IntgSrmErpReceiptSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("intg:srm-erp:receipt:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody IntgSrmErpReceiptSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("intg:srm-erp:receipt:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
