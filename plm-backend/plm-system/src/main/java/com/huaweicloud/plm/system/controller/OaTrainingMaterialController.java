package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.OaTestQuery;
import com.huaweicloud.plm.system.dto.OaTrainingMaterialSaveRequest;
import com.huaweicloud.plm.system.entity.OaTrainingMaterial;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaTrainingMaterialService;
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

import java.util.Map;

/**
 * 培训交付材料接口（OA-DEV-112）：培训材料名称、类型、目标角色、发布版本与签到情况。
 */
@RestController
@RequestMapping("/oa/test/training-materials")
@RequiredArgsConstructor
public class OaTrainingMaterialController {

    private final OaTrainingMaterialService service;

    @GetMapping
    @RequirePermission("oa:test:training:list")
    public ApiResponse<PageResult<OaTrainingMaterial>> page(OaTestQuery query) {
        return ApiResponse.success(service.pageTrainingMaterials(query));
    }

    @GetMapping("/stats")
    @RequirePermission("oa:test:training:list")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.success(service.stats());
    }

    @GetMapping("/{id}")
    @RequirePermission("oa:test:training:list")
    public ApiResponse<OaTrainingMaterial> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("oa:test:training:manage")
    public ApiResponse<Long> create(@Valid @RequestBody OaTrainingMaterialSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("oa:test:training:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody OaTrainingMaterialSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("oa:test:training:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }

    /** 登记一次签到。 */
    @PostMapping("/{id}/sign")
    @RequirePermission("oa:test:training:manage")
    public ApiResponse<OaTrainingMaterial> sign(@PathVariable Long id) {
        return ApiResponse.success(service.sign(id));
    }
}
