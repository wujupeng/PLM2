package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.SpecInstanceDetailResponse;
import com.huaweicloud.plm.system.dto.SpecInstanceQuery;
import com.huaweicloud.plm.system.dto.SpecInstanceSaveRequest;
import com.huaweicloud.plm.system.dto.SpecInstanceValueSaveRequest;
import com.huaweicloud.plm.system.entity.SpecInstance;
import com.huaweicloud.plm.system.entity.SpecInstanceValue;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SpecInstanceService;
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

import java.util.List;

/**
 * 产品技术规格实例与电气性能指标接口（DEV-043）。
 */
@RestController
@RequestMapping("/spec/instances")
@RequiredArgsConstructor
public class SpecInstanceController {

    private final SpecInstanceService specInstanceService;

    @GetMapping
    @RequirePermission("spec:list")
    public ApiResponse<PageResult<SpecInstance>> page(SpecInstanceQuery query) {
        return ApiResponse.success(specInstanceService.page(query));
    }

    @GetMapping("/by-product/{productCode}")
    @RequirePermission("spec:list")
    public ApiResponse<List<SpecInstance>> byProduct(@PathVariable String productCode) {
        return ApiResponse.success(specInstanceService.byProduct(productCode));
    }

    @GetMapping("/{id}")
    @RequirePermission("spec:list")
    public ApiResponse<SpecInstanceDetailResponse> detail(@PathVariable Long id) {
        return ApiResponse.success(specInstanceService.detail(id));
    }

    @GetMapping("/{id}/values")
    @RequirePermission("spec:list")
    public ApiResponse<List<SpecInstanceValue>> values(@PathVariable Long id) {
        return ApiResponse.success(specInstanceService.values(id));
    }

    @PostMapping
    @RequirePermission("spec:create")
    public ApiResponse<Long> create(@Valid @RequestBody SpecInstanceSaveRequest request) {
        return ApiResponse.success(specInstanceService.create(request));
    }

    @PutMapping("/{id}")
    @RequirePermission("spec:update")
    public ApiResponse<Void> update(@PathVariable Long id,
                                    @Valid @RequestBody SpecInstanceSaveRequest request) {
        specInstanceService.update(id, request);
        return ApiResponse.success();
    }

    @PutMapping("/{id}/values")
    @RequirePermission("spec:update")
    public ApiResponse<Void> saveValues(@PathVariable Long id,
                                        @RequestBody List<SpecInstanceValueSaveRequest> values) {
        specInstanceService.saveValues(id, values);
        return ApiResponse.success();
    }

    @DeleteMapping("/{id}")
    @RequirePermission("spec:delete")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        specInstanceService.delete(id);
        return ApiResponse.success();
    }

    @PostMapping("/{id}/release")
    @RequirePermission("spec:release")
    public ApiResponse<Void> release(@PathVariable Long id) {
        specInstanceService.release(id);
        return ApiResponse.success();
    }
}
