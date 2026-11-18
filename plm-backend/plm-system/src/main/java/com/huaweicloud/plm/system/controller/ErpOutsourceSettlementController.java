package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ErpOutsourceSettlementQuery;
import com.huaweicloud.plm.system.dto.ErpOutsourceSettlementSaveRequest;
import com.huaweicloud.plm.system.entity.ErpOutsourceSettlement;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ErpOutsourceSettlementService;
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
 * 委外结算单接口（对应 WBS T024 委外管理，属 G3 ERP）：
 * 委外结算登记、分页查询与删除。
 */
@RestController
@RequestMapping("/erp/outsource/settlements")
@RequiredArgsConstructor
public class ErpOutsourceSettlementController {

    private final ErpOutsourceSettlementService service;

    @GetMapping
    @RequirePermission("erp:outsource:settlement:list")
    public ApiResponse<PageResult<ErpOutsourceSettlement>> page(ErpOutsourceSettlementQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("erp:outsource:settlement:list")
    public ApiResponse<ErpOutsourceSettlement> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("erp:outsource:settlement:manage")
    public ApiResponse<Long> create(@Valid @RequestBody ErpOutsourceSettlementSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("erp:outsource:settlement:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody ErpOutsourceSettlementSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("erp:outsource:settlement:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
