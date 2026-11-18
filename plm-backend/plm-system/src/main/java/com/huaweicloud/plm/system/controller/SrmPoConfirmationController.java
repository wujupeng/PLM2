package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.SrmPoConfirmationQuery;
import com.huaweicloud.plm.system.dto.SrmPoConfirmationSaveRequest;
import com.huaweicloud.plm.system.entity.SrmPoConfirmation;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SrmPoConfirmationService;
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
 * 订单确认接口（对应订单确认）：
 * 订单确认登记、分页查询与删除。
 */
@RestController
@RequestMapping("/srm/po-confirmations")
@RequiredArgsConstructor
public class SrmPoConfirmationController {

    private final SrmPoConfirmationService service;

    @GetMapping
    @RequirePermission("srm:collab:po-confirm:list")
    public ApiResponse<PageResult<SrmPoConfirmation>> page(SrmPoConfirmationQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("srm:collab:po-confirm:list")
    public ApiResponse<SrmPoConfirmation> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("srm:collab:po-confirm:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SrmPoConfirmationSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("srm:collab:po-confirm:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SrmPoConfirmationSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("srm:collab:po-confirm:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
