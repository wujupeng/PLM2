package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.SrmRfqQuery;
import com.huaweicloud.plm.system.dto.SrmRfqSaveRequest;
import com.huaweicloud.plm.system.entity.SrmRfq;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SrmRfqService;
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
 * 询价单接口（对应询价单）：
 * 询价单登记、分页查询与删除。
 */
@RestController
@RequestMapping("/srm/rfqs")
@RequiredArgsConstructor
public class SrmRfqController {

    private final SrmRfqService service;

    @GetMapping
    @RequirePermission("srm:sourcing:rfq:list")
    public ApiResponse<PageResult<SrmRfq>> page(SrmRfqQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("srm:sourcing:rfq:list")
    public ApiResponse<SrmRfq> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("srm:sourcing:rfq:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SrmRfqSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("srm:sourcing:rfq:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SrmRfqSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("srm:sourcing:rfq:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
