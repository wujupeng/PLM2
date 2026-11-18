package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.EdiAsnDetailResponse;
import com.huaweicloud.plm.system.dto.EdiAsnQuery;
import com.huaweicloud.plm.system.dto.EdiAsnSaveRequest;
import com.huaweicloud.plm.system.entity.EdiAsn;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.EdiAsnService;
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
 * ASN 交付接口（N6，DEV-072）。
 */
@RestController
@RequestMapping("/edi/asns")
@RequiredArgsConstructor
public class EdiAsnController {

    private final EdiAsnService ediAsnService;

    @GetMapping
    @RequirePermission("edi:asn:list")
    public ApiResponse<PageResult<EdiAsn>> page(EdiAsnQuery query) {
        return ApiResponse.success(ediAsnService.page(query));
    }

    @GetMapping("/{asnNo}")
    @RequirePermission("edi:asn:list")
    public ApiResponse<EdiAsnDetailResponse> detail(@PathVariable String asnNo) {
        return ApiResponse.success(ediAsnService.detail(asnNo));
    }

    @GetMapping("/by-demand/{demandNo}")
    @RequirePermission("edi:asn:list")
    public ApiResponse<List<EdiAsn>> listByDemand(@PathVariable String demandNo) {
        return ApiResponse.success(ediAsnService.listByDemand(demandNo));
    }

    @PostMapping
    @RequirePermission("edi:asn:save")
    public ApiResponse<Long> create(@Valid @RequestBody EdiAsnSaveRequest request) {
        return ApiResponse.success(ediAsnService.create(request));
    }

    @PutMapping("/{asnNo}")
    @RequirePermission("edi:asn:save")
    public ApiResponse<Void> update(@PathVariable String asnNo,
                                    @Valid @RequestBody EdiAsnSaveRequest request) {
        ediAsnService.update(asnNo, request);
        return ApiResponse.success();
    }

    @PostMapping("/{asnNo}/send")
    @RequirePermission("edi:asn:send")
    public ApiResponse<Void> send(@PathVariable String asnNo) {
        ediAsnService.send(asnNo);
        return ApiResponse.success();
    }

    @PostMapping("/{asnNo}/cancel")
    @RequirePermission("edi:asn:save")
    public ApiResponse<Void> cancel(@PathVariable String asnNo) {
        ediAsnService.cancel(asnNo);
        return ApiResponse.success();
    }
}
