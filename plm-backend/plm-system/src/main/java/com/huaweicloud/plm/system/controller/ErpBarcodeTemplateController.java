package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ErpBarcodeTemplateQuery;
import com.huaweicloud.plm.system.dto.ErpBarcodeTemplateSaveRequest;
import com.huaweicloud.plm.system.entity.ErpBarcodeTemplate;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ErpBarcodeTemplateService;
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
 * 标签模板接口（对应 WBS G3-N7a ERP 条码管理）：
 * 标签模板登记、分页查询与删除。
 */
@RestController
@RequestMapping("/erp/barcode/templates")
@RequiredArgsConstructor
public class ErpBarcodeTemplateController {

    private final ErpBarcodeTemplateService service;

    @GetMapping
    @RequirePermission("erp:barcode:template:list")
    public ApiResponse<PageResult<ErpBarcodeTemplate>> page(ErpBarcodeTemplateQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("erp:barcode:template:list")
    public ApiResponse<ErpBarcodeTemplate> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("erp:barcode:template:manage")
    public ApiResponse<Long> create(@Valid @RequestBody ErpBarcodeTemplateSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("erp:barcode:template:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody ErpBarcodeTemplateSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("erp:barcode:template:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
