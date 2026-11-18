package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ErpOutsourceReturnQuery;
import com.huaweicloud.plm.system.dto.ErpOutsourceReturnSaveRequest;
import com.huaweicloud.plm.system.entity.ErpOutsourceReturn;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ErpOutsourceReturnService;
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
 * 委外退货单接口（对应 WBS T024/T094 委外加工闭环，属 G3 ERP）：
 * 委外退货登记、分页查询与删除。
 */
@RestController
@RequestMapping("/erp/outsource/returns")
@RequiredArgsConstructor
public class ErpOutsourceReturnController {

    private final ErpOutsourceReturnService service;

    @GetMapping
    @RequirePermission("erp:outsource:return:list")
    public ApiResponse<PageResult<ErpOutsourceReturn>> page(ErpOutsourceReturnQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("erp:outsource:return:list")
    public ApiResponse<ErpOutsourceReturn> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("erp:outsource:return:manage")
    public ApiResponse<Long> create(@Valid @RequestBody ErpOutsourceReturnSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("erp:outsource:return:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody ErpOutsourceReturnSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("erp:outsource:return:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
