package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.EdiDemandDispatchRequest;
import com.huaweicloud.plm.system.dto.EdiDispatchQuery;
import com.huaweicloud.plm.system.entity.EdiDemandDispatch;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.EdiDispatchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 需求向供应商分发接口（N6，DEV-070）。
 */
@RestController
@RequestMapping("/edi/dispatches")
@RequiredArgsConstructor
public class EdiDispatchController {

    private final EdiDispatchService ediDispatchService;

    @GetMapping
    @RequirePermission("edi:dispatch:list")
    public ApiResponse<PageResult<EdiDemandDispatch>> page(EdiDispatchQuery query) {
        return ApiResponse.success(ediDispatchService.page(query));
    }

    @GetMapping("/{dispatchNo}")
    @RequirePermission("edi:dispatch:list")
    public ApiResponse<EdiDemandDispatch> detail(@PathVariable String dispatchNo) {
        return ApiResponse.success(ediDispatchService.detail(dispatchNo));
    }

    @GetMapping("/by-demand/{demandNo}")
    @RequirePermission("edi:dispatch:list")
    public ApiResponse<List<EdiDemandDispatch>> listByDemand(@PathVariable String demandNo) {
        return ApiResponse.success(ediDispatchService.listByDemand(demandNo));
    }

    @PostMapping("/dispatch")
    @RequirePermission("edi:demand:dispatch")
    public ApiResponse<List<EdiDemandDispatch>> dispatch(@Valid @RequestBody EdiDemandDispatchRequest request) {
        return ApiResponse.success(ediDispatchService.dispatch(request));
    }

    @PostMapping("/{dispatchNo}/send")
    @RequirePermission("edi:dispatch:send")
    public ApiResponse<Void> send(@PathVariable String dispatchNo) {
        ediDispatchService.send(dispatchNo);
        return ApiResponse.success();
    }
}
