package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.EdiTransactionLogQuery;
import com.huaweicloud.plm.system.entity.EdiTransactionLog;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.EdiTransactionLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * EDI 交易日志接口（N6，DEV-073）。
 */
@RestController
@RequestMapping("/edi/logs")
@RequiredArgsConstructor
public class EdiTransactionLogController {

    private final EdiTransactionLogService ediTransactionLogService;

    @GetMapping
    @RequirePermission("edi:monitor:list")
    public ApiResponse<PageResult<EdiTransactionLog>> page(EdiTransactionLogQuery query) {
        return ApiResponse.success(ediTransactionLogService.page(query));
    }

    @GetMapping("/by-message/{messageNo}")
    @RequirePermission("edi:monitor:list")
    public ApiResponse<List<EdiTransactionLog>> listByMessage(@PathVariable String messageNo) {
        return ApiResponse.success(ediTransactionLogService.listByMessage(messageNo));
    }
}
