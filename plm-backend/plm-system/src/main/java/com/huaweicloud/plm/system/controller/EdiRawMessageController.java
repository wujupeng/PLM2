package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.EdiMessageReceiveRequest;
import com.huaweicloud.plm.system.dto.EdiRawMessageQuery;
import com.huaweicloud.plm.system.entity.EdiRawMessage;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.EdiMessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * EDI 报文接收与监控台接口（N6，DEV-064/065/068）。
 */
@RestController
@RequestMapping("/edi/raw-messages")
@RequiredArgsConstructor
public class EdiRawMessageController {

    private final EdiMessageService ediMessageService;

    @GetMapping
    @RequirePermission("edi:monitor:list")
    public ApiResponse<PageResult<EdiRawMessage>> page(EdiRawMessageQuery query) {
        return ApiResponse.success(ediMessageService.page(query));
    }

    @GetMapping("/{messageNo}")
    @RequirePermission("edi:monitor:list")
    public ApiResponse<EdiRawMessage> detail(@PathVariable String messageNo) {
        return ApiResponse.success(ediMessageService.detail(messageNo));
    }

    @PostMapping("/receive")
    @RequirePermission("edi:demand:parse")
    public ApiResponse<EdiRawMessage> receive(@Valid @RequestBody EdiMessageReceiveRequest request) {
        return ApiResponse.success(ediMessageService.receive(request));
    }

    @PostMapping("/{messageNo}/parse")
    @RequirePermission("edi:demand:parse")
    public ApiResponse<EdiRawMessage> parse(@PathVariable String messageNo) {
        return ApiResponse.success(ediMessageService.parse(messageNo));
    }

    @PostMapping("/{messageNo}/retry")
    @RequirePermission("edi:monitor:retry")
    public ApiResponse<EdiRawMessage> retry(@PathVariable String messageNo) {
        return ApiResponse.success(ediMessageService.retry(messageNo));
    }

    @PostMapping("/{messageNo}/replay")
    @RequirePermission("edi:monitor:replay")
    public ApiResponse<EdiRawMessage> replay(@PathVariable String messageNo) {
        return ApiResponse.success(ediMessageService.replay(messageNo));
    }
}
