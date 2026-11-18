package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.SpecTemplateDetailResponse;
import com.huaweicloud.plm.system.dto.SpecTemplateQuery;
import com.huaweicloud.plm.system.dto.SpecTemplateSaveRequest;
import com.huaweicloud.plm.system.entity.SpecTemplate;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SpecTemplateService;
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
 * 产品技术规格模板接口（DEV-042）。
 */
@RestController
@RequestMapping("/spec/templates")
@RequiredArgsConstructor
public class SpecTemplateController {

    private final SpecTemplateService specTemplateService;

    @GetMapping
    @RequirePermission("spec:template:list")
    public ApiResponse<PageResult<SpecTemplate>> page(SpecTemplateQuery query) {
        return ApiResponse.success(specTemplateService.page(query));
    }

    @GetMapping("/options")
    @RequirePermission("spec:template:list")
    public ApiResponse<List<SpecTemplate>> options() {
        return ApiResponse.success(specTemplateService.options());
    }

    @GetMapping("/{id}")
    @RequirePermission("spec:template:list")
    public ApiResponse<SpecTemplateDetailResponse> detail(@PathVariable Long id) {
        return ApiResponse.success(specTemplateService.detail(id));
    }

    @PostMapping
    @RequirePermission("spec:template:save")
    public ApiResponse<Long> create(@Valid @RequestBody SpecTemplateSaveRequest request) {
        return ApiResponse.success(specTemplateService.create(request));
    }

    @PutMapping("/{id}")
    @RequirePermission("spec:template:save")
    public ApiResponse<Void> update(@PathVariable Long id,
                                    @Valid @RequestBody SpecTemplateSaveRequest request) {
        specTemplateService.update(id, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{id}")
    @RequirePermission("spec:template:save")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        specTemplateService.delete(id);
        return ApiResponse.success();
    }

    @PostMapping("/{id}/release")
    @RequirePermission("spec:template:save")
    public ApiResponse<Void> release(@PathVariable Long id) {
        specTemplateService.release(id);
        return ApiResponse.success();
    }
}
