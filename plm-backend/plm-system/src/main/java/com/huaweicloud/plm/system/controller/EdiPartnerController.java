package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.EdiPartnerQuery;
import com.huaweicloud.plm.system.dto.EdiPartnerSaveRequest;
import com.huaweicloud.plm.system.entity.EdiPartner;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.EdiPartnerService;
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

import java.util.List;

/**
 * EDI 伙伴与通道接口（N6，DEV-063）。
 */
@RestController
@RequestMapping("/edi/partners")
@RequiredArgsConstructor
public class EdiPartnerController {

    private final EdiPartnerService ediPartnerService;

    @GetMapping
    @RequirePermission("edi:partner:list")
    public ApiResponse<PageResult<EdiPartner>> page(EdiPartnerQuery query) {
        return ApiResponse.success(ediPartnerService.page(query));
    }

    @GetMapping("/options")
    @RequirePermission("edi:partner:list")
    public ApiResponse<List<EdiPartner>> options(@RequestParam(required = false) String partnerType) {
        return ApiResponse.success(ediPartnerService.options(partnerType));
    }

    @GetMapping("/{partnerId}")
    @RequirePermission("edi:partner:list")
    public ApiResponse<EdiPartner> detail(@PathVariable Long partnerId) {
        return ApiResponse.success(ediPartnerService.requirePartner(partnerId));
    }

    @PostMapping
    @RequirePermission("edi:partner:save")
    public ApiResponse<Long> create(@Valid @RequestBody EdiPartnerSaveRequest request) {
        return ApiResponse.success(ediPartnerService.create(request));
    }

    @PutMapping("/{partnerId}")
    @RequirePermission("edi:partner:save")
    public ApiResponse<Void> update(@PathVariable Long partnerId,
                                    @Valid @RequestBody EdiPartnerSaveRequest request) {
        ediPartnerService.update(partnerId, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{partnerId}")
    @RequirePermission("edi:partner:delete")
    public ApiResponse<Void> delete(@PathVariable Long partnerId) {
        ediPartnerService.delete(partnerId);
        return ApiResponse.success();
    }
}
