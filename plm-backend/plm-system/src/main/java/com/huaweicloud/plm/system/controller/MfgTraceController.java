package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MfgForwardTraceResponse;
import com.huaweicloud.plm.system.dto.MfgTraceBindingQuery;
import com.huaweicloud.plm.system.dto.MfgTraceBindingSaveRequest;
import com.huaweicloud.plm.system.dto.MfgTraceQuery;
import com.huaweicloud.plm.system.dto.MfgTraceResponse;
import com.huaweicloud.plm.system.entity.MfgTraceBinding;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MfgTraceBindingService;
import com.huaweicloud.plm.system.service.MfgTraceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 全流程正反向追溯与追溯绑定接口（N8，DEV-088/093）。
 */
@RestController
@RequestMapping("/mfg/traces")
@RequiredArgsConstructor
public class MfgTraceController {

    private final MfgTraceService mfgTraceService;
    private final MfgTraceBindingService mfgTraceBindingService;

    // ==================== 追溯绑定（DEV-088） ====================

    @GetMapping("/bindings")
    @RequirePermission("mfg:trace:list")
    public ApiResponse<PageResult<MfgTraceBinding>> bindingPage(MfgTraceBindingQuery query) {
        return ApiResponse.success(mfgTraceBindingService.page(query));
    }

    @GetMapping("/bindings/{id}")
    @RequirePermission("mfg:trace:list")
    public ApiResponse<MfgTraceBinding> bindingDetail(@PathVariable Long id) {
        return ApiResponse.success(mfgTraceBindingService.require(id));
    }

    @PostMapping("/bindings")
    @RequirePermission("mfg:trace:save")
    public ApiResponse<Long> createBinding(@Valid @RequestBody MfgTraceBindingSaveRequest request) {
        return ApiResponse.success(mfgTraceBindingService.create(request));
    }

    @PutMapping("/bindings/{id}")
    @RequirePermission("mfg:trace:save")
    public ApiResponse<Void> updateBinding(@PathVariable Long id,
                                          @Valid @RequestBody MfgTraceBindingSaveRequest request) {
        mfgTraceBindingService.update(id, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/bindings/{id}")
    @RequirePermission("mfg:trace:save")
    public ApiResponse<Void> deleteBinding(@PathVariable Long id) {
        mfgTraceBindingService.delete(id);
        return ApiResponse.success();
    }

    // ==================== 追溯查询（DEV-093） ====================

    @GetMapping("/backward")
    @RequirePermission("mfg:trace:list")
    public ApiResponse<MfgTraceResponse> backward(@RequestParam(required = false) String traceCode,
                                                  @RequestParam(required = false) String serialNo,
                                                  @RequestParam(required = false) String batchNo) {
        MfgTraceQuery query = new MfgTraceQuery();
        query.setTraceCode(traceCode);
        query.setSerialNo(serialNo);
        query.setBatchNo(batchNo);
        return ApiResponse.success(mfgTraceService.trace(query));
    }

    @GetMapping("/forward")
    @RequirePermission("mfg:trace:list")
    public ApiResponse<MfgForwardTraceResponse> forward(@RequestParam(required = false) String materialCode,
                                                        @RequestParam(required = false) String materialBatchNo) {
        MfgTraceQuery query = new MfgTraceQuery();
        query.setMaterialCode(materialCode);
        query.setMaterialBatchNo(materialBatchNo);
        return ApiResponse.success(mfgTraceService.forwardTrace(query));
    }
}
