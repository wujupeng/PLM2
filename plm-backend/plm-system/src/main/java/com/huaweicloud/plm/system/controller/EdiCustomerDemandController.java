package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.EdiCustomerDemandQuery;
import com.huaweicloud.plm.system.dto.EdiDemandDispatchRequest;
import com.huaweicloud.plm.system.entity.EdiCustomerDemand;
import com.huaweicloud.plm.system.entity.EdiDemandChangeLog;
import com.huaweicloud.plm.system.entity.EdiDemandDispatch;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.EdiCustomerDemandService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 客户需求接口（N6，DEV-066/069/070）。
 */
@RestController
@RequestMapping("/edi/demands")
@RequiredArgsConstructor
public class EdiCustomerDemandController {

    private final EdiCustomerDemandService ediCustomerDemandService;

    @GetMapping
    @RequirePermission("edi:demand:list")
    public ApiResponse<PageResult<EdiCustomerDemand>> page(EdiCustomerDemandQuery query) {
        return ApiResponse.success(ediCustomerDemandService.page(query));
    }

    @GetMapping("/{demandNo}")
    @RequirePermission("edi:demand:list")
    public ApiResponse<EdiCustomerDemand> detail(@PathVariable String demandNo) {
        return ApiResponse.success(ediCustomerDemandService.detail(demandNo));
    }

    @GetMapping("/{demandNo}/changes")
    @RequirePermission("edi:demand:list")
    public ApiResponse<List<EdiDemandChangeLog>> listChanges(@PathVariable String demandNo) {
        return ApiResponse.success(ediCustomerDemandService.listChanges(demandNo));
    }

    @PostMapping("/{demandNo}/dispatch")
    @RequirePermission("edi:demand:dispatch")
    public ApiResponse<List<EdiDemandDispatch>> dispatch(@PathVariable String demandNo,
                                                         @RequestBody EdiDemandDispatchRequest request) {
        return ApiResponse.success(ediCustomerDemandService.dispatch(demandNo, request));
    }
}
