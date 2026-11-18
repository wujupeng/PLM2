package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ErpBarcodeRuleQuery;
import com.huaweicloud.plm.system.dto.ErpBarcodeRuleSaveRequest;
import com.huaweicloud.plm.system.entity.ErpBarcodeRule;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ErpBarcodeRuleService;
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
 * 扫码规则接口（对应 G3-N7a ERP 条码管理）：
 * 扫码规则登记、分页查询与删除。
 */
@RestController
@RequestMapping("/erp/barcode/rules")
@RequiredArgsConstructor
public class ErpBarcodeRuleController {

    private final ErpBarcodeRuleService service;

    @GetMapping
    @RequirePermission("erp:barcode:rule:list")
    public ApiResponse<PageResult<ErpBarcodeRule>> page(ErpBarcodeRuleQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("erp:barcode:rule:list")
    public ApiResponse<ErpBarcodeRule> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("erp:barcode:rule:manage")
    public ApiResponse<Long> create(@Valid @RequestBody ErpBarcodeRuleSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("erp:barcode:rule:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody ErpBarcodeRuleSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("erp:barcode:rule:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
