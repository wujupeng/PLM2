package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ErpFinanceCostCollectionQuery;
import com.huaweicloud.plm.system.dto.ErpFinanceCostCollectionSaveRequest;
import com.huaweicloud.plm.system.entity.ErpFinanceCostCollection;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ErpFinanceCostCollectionService;
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
 * 成本归集接口（对应 WBS T028 ERP 财务，属 G3-N6 ERP 财务）：
 * 成本归集登记、分页查询与删除。
 */
@RestController
@RequestMapping("/erp/finance/cost-collections")
@RequiredArgsConstructor
public class ErpFinanceCostCollectionController {

    private final ErpFinanceCostCollectionService service;

    @GetMapping
    @RequirePermission("erp:finance:cost-collection:list")
    public ApiResponse<PageResult<ErpFinanceCostCollection>> page(ErpFinanceCostCollectionQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("erp:finance:cost-collection:list")
    public ApiResponse<ErpFinanceCostCollection> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("erp:finance:cost-collection:manage")
    public ApiResponse<Long> create(@Valid @RequestBody ErpFinanceCostCollectionSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("erp:finance:cost-collection:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody ErpFinanceCostCollectionSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("erp:finance:cost-collection:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
