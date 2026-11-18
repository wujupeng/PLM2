package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.SrmAsnQuery;
import com.huaweicloud.plm.system.dto.SrmAsnSaveRequest;
import com.huaweicloud.plm.system.entity.SrmAsn;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SrmAsnService;
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
 * ASN 发货通知接口（对应 ASN 发货通知）：
 * 发货通知登记、分页查询与删除。
 */
@RestController
@RequestMapping("/srm/asns")
@RequiredArgsConstructor
public class SrmAsnController {

    private final SrmAsnService service;

    @GetMapping
    @RequirePermission("srm:collab:asn:list")
    public ApiResponse<PageResult<SrmAsn>> page(SrmAsnQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("srm:collab:asn:list")
    public ApiResponse<SrmAsn> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("srm:collab:asn:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SrmAsnSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("srm:collab:asn:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SrmAsnSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("srm:collab:asn:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
