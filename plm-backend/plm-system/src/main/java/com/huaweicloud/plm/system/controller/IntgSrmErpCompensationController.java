package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IntgSrmErpCompensationQuery;
import com.huaweicloud.plm.system.dto.IntgSrmErpCompensationSaveRequest;
import com.huaweicloud.plm.system.entity.IntgSrmErpCompensation;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.IntgSrmErpCompensationService;
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
 * SRM→ERP 异常补偿接口：SRM→ERP 集成异常补偿的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/intg/srm-erp/compensations")
@RequiredArgsConstructor
public class IntgSrmErpCompensationController {

    private final IntgSrmErpCompensationService service;

    @GetMapping
    @RequirePermission("intg:srm-erp:compensation:list")
    public ApiResponse<PageResult<IntgSrmErpCompensation>> page(IntgSrmErpCompensationQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("intg:srm-erp:compensation:list")
    public ApiResponse<IntgSrmErpCompensation> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("intg:srm-erp:compensation:manage")
    public ApiResponse<Long> create(@Valid @RequestBody IntgSrmErpCompensationSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("intg:srm-erp:compensation:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody IntgSrmErpCompensationSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("intg:srm-erp:compensation:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
