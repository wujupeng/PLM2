package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IntgEdiGatewayCompensationQuery;
import com.huaweicloud.plm.system.dto.IntgEdiGatewayCompensationSaveRequest;
import com.huaweicloud.plm.system.entity.IntgEdiGatewayCompensation;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.IntgEdiGatewayCompensationService;
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
 * EDI 网关异常补偿接口：EDI 网关集成异常补偿的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/intg/edi-gateway/compensations")
@RequiredArgsConstructor
public class IntgEdiGatewayCompensationController {

    private final IntgEdiGatewayCompensationService service;

    @GetMapping
    @RequirePermission("intg:edi-gateway:compensation:list")
    public ApiResponse<PageResult<IntgEdiGatewayCompensation>> page(IntgEdiGatewayCompensationQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("intg:edi-gateway:compensation:list")
    public ApiResponse<IntgEdiGatewayCompensation> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("intg:edi-gateway:compensation:manage")
    public ApiResponse<Long> create(@Valid @RequestBody IntgEdiGatewayCompensationSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("intg:edi-gateway:compensation:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody IntgEdiGatewayCompensationSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("intg:edi-gateway:compensation:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
