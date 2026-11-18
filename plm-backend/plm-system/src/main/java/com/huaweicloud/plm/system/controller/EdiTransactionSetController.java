package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.EdiTransactionSetQuery;
import com.huaweicloud.plm.system.dto.EdiTransactionSetSaveRequest;
import com.huaweicloud.plm.system.entity.EdiTransactionSet;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.EdiTransactionSetService;
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
 * EDI 交易集配置接口（N6，DEV-074）。
 */
@RestController
@RequestMapping("/edi/transaction-sets")
@RequiredArgsConstructor
public class EdiTransactionSetController {

    private final EdiTransactionSetService ediTransactionSetService;

    @GetMapping
    @RequirePermission("edi:transset:list")
    public ApiResponse<PageResult<EdiTransactionSet>> page(EdiTransactionSetQuery query) {
        return ApiResponse.success(ediTransactionSetService.page(query));
    }

    @GetMapping("/{transSetId}")
    @RequirePermission("edi:transset:list")
    public ApiResponse<EdiTransactionSet> detail(@PathVariable Long transSetId) {
        return ApiResponse.success(ediTransactionSetService.requireById(transSetId));
    }

    @PostMapping
    @RequirePermission("edi:transset:save")
    public ApiResponse<Long> create(@Valid @RequestBody EdiTransactionSetSaveRequest request) {
        return ApiResponse.success(ediTransactionSetService.create(request));
    }

    @PutMapping("/{transSetId}")
    @RequirePermission("edi:transset:save")
    public ApiResponse<Void> update(@PathVariable Long transSetId,
                                    @Valid @RequestBody EdiTransactionSetSaveRequest request) {
        ediTransactionSetService.update(transSetId, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{transSetId}")
    @RequirePermission("edi:transset:delete")
    public ApiResponse<Void> delete(@PathVariable Long transSetId) {
        ediTransactionSetService.delete(transSetId);
        return ApiResponse.success();
    }
}
