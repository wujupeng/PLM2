package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.WmsShortageCalcRequest;
import com.huaweicloud.plm.system.dto.WmsShortageCaseActionRequest;
import com.huaweicloud.plm.system.dto.WmsShortageCaseCloseRequest;
import com.huaweicloud.plm.system.dto.WmsShortageCaseCreateRequest;
import com.huaweicloud.plm.system.dto.WmsShortageCaseQuery;
import com.huaweicloud.plm.system.dto.WmsShortageCaseUpdateRequest;
import com.huaweicloud.plm.system.dto.WmsWarningQuery;
import com.huaweicloud.plm.system.entity.WmsShortageAction;
import com.huaweicloud.plm.system.entity.WmsShortageCase;
import com.huaweicloud.plm.system.entity.WmsShortageWarning;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.WmsShortageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 缺料预警与欠料异常闭环接口（N7，DEV-082/083）。
 */
@RestController
@RequestMapping("/wms/shortages")
@RequiredArgsConstructor
public class WmsShortageController {

    private final WmsShortageService wmsShortageService;

    // ==================== 缺料预警 ====================

    @GetMapping("/warnings")
    @RequirePermission("wms:shortage:list")
    public ApiResponse<PageResult<WmsShortageWarning>> warningPage(WmsWarningQuery query) {
        return ApiResponse.success(wmsShortageService.warningPage(query));
    }

    @GetMapping("/warnings/{warningNo}")
    @RequirePermission("wms:shortage:list")
    public ApiResponse<WmsShortageWarning> warningDetail(@PathVariable String warningNo) {
        return ApiResponse.success(wmsShortageService.requireWarning(warningNo));
    }

    @PostMapping("/warnings/calculate")
    @RequirePermission("wms:shortage:calculate")
    public ApiResponse<WmsShortageWarning> calculate(@Valid @RequestBody WmsShortageCalcRequest request) {
        return ApiResponse.success(wmsShortageService.calculate(request));
    }

    // ==================== 欠料异常闭环 ====================

    @GetMapping("/cases")
    @RequirePermission("wms:shortage:list")
    public ApiResponse<PageResult<WmsShortageCase>> casePage(WmsShortageCaseQuery query) {
        return ApiResponse.success(wmsShortageService.casePage(query));
    }

    @GetMapping("/cases/{caseNo}")
    @RequirePermission("wms:shortage:list")
    public ApiResponse<WmsShortageCase> caseDetail(@PathVariable String caseNo) {
        return ApiResponse.success(wmsShortageService.requireCase(caseNo));
    }

    @GetMapping("/cases/{caseNo}/actions")
    @RequirePermission("wms:shortage:list")
    public ApiResponse<List<WmsShortageAction>> listActions(@PathVariable String caseNo) {
        return ApiResponse.success(wmsShortageService.listActions(caseNo));
    }

    @PostMapping("/cases")
    @RequirePermission("wms:shortage:handle")
    public ApiResponse<String> createCase(@Valid @RequestBody WmsShortageCaseCreateRequest request) {
        return ApiResponse.success(wmsShortageService.createCase(request));
    }

    @PutMapping("/cases/{caseNo}")
    @RequirePermission("wms:shortage:handle")
    public ApiResponse<Void> updateCase(@PathVariable String caseNo,
                                        @Valid @RequestBody WmsShortageCaseUpdateRequest request) {
        wmsShortageService.updateCase(caseNo, request);
        return ApiResponse.success();
    }

    @PostMapping("/cases/{caseNo}/actions")
    @RequirePermission("wms:shortage:handle")
    public ApiResponse<Void> addAction(@PathVariable String caseNo,
                                       @Valid @RequestBody WmsShortageCaseActionRequest request) {
        wmsShortageService.addAction(caseNo, request);
        return ApiResponse.success();
    }

    @PostMapping("/cases/{caseNo}/close")
    @RequirePermission("wms:shortage:handle")
    public ApiResponse<Void> closeCase(@PathVariable String caseNo,
                                       @Valid @RequestBody WmsShortageCaseCloseRequest request) {
        wmsShortageService.closeCase(caseNo, request);
        return ApiResponse.success();
    }
}
