package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.EdiAckQuery;
import com.huaweicloud.plm.system.dto.EdiAckRequest;
import com.huaweicloud.plm.system.entity.EdiSupplierAck;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.EdiSupplierAckService;
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
 * 供应商确认与回执接口（N6，DEV-071）。
 */
@RestController
@RequestMapping("/edi/supplier-acks")
@RequiredArgsConstructor
public class EdiSupplierAckController {

    private final EdiSupplierAckService ediSupplierAckService;

    @GetMapping
    @RequirePermission("edi:ack:list")
    public ApiResponse<PageResult<EdiSupplierAck>> page(EdiAckQuery query) {
        return ApiResponse.success(ediSupplierAckService.page(query));
    }

    @GetMapping("/{ackNo}")
    @RequirePermission("edi:ack:list")
    public ApiResponse<EdiSupplierAck> detail(@PathVariable String ackNo) {
        return ApiResponse.success(ediSupplierAckService.requireAck(ackNo));
    }

    @GetMapping("/by-dispatch/{dispatchNo}")
    @RequirePermission("edi:ack:list")
    public ApiResponse<List<EdiSupplierAck>> listByDispatch(@PathVariable String dispatchNo) {
        return ApiResponse.success(ediSupplierAckService.listByDispatch(dispatchNo));
    }

    @PostMapping
    @RequirePermission("edi:ack:list")
    public ApiResponse<Long> ack(@Valid @RequestBody EdiAckRequest request) {
        return ApiResponse.success(ediSupplierAckService.ack(request));
    }
}
