package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.LabelRenderRequest;
import com.huaweicloud.plm.system.dto.LabelRenderResponse;
import com.huaweicloud.plm.system.dto.LabelTemplateQuery;
import com.huaweicloud.plm.system.dto.LabelTemplateSaveRequest;
import com.huaweicloud.plm.system.entity.LabelTemplate;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.LabelTemplateService;
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
 * 标签模板配置接口（N5）。
 */
@RestController
@RequestMapping("/label/templates")
@RequiredArgsConstructor
public class LabelTemplateController {

    private final LabelTemplateService labelTemplateService;

    @GetMapping
    @RequirePermission("label:template:list")
    public ApiResponse<PageResult<LabelTemplate>> page(LabelTemplateQuery query) {
        return ApiResponse.success(labelTemplateService.page(query));
    }

    @GetMapping("/options")
    @RequirePermission("label:template:list")
    public ApiResponse<List<LabelTemplate>> options(@RequestParam(required = false) String labelType) {
        return ApiResponse.success(labelTemplateService.listOptions(labelType));
    }

    @GetMapping("/{templateId}")
    @RequirePermission("label:template:list")
    public ApiResponse<LabelTemplate> detail(@PathVariable Long templateId) {
        return ApiResponse.success(labelTemplateService.detail(templateId));
    }

    @PostMapping
    @RequirePermission("label:template:save")
    public ApiResponse<Long> create(@Valid @RequestBody LabelTemplateSaveRequest request) {
        return ApiResponse.success(labelTemplateService.create(request));
    }

    @PutMapping("/{templateId}")
    @RequirePermission("label:template:save")
    public ApiResponse<Void> update(@PathVariable Long templateId,
                                    @Valid @RequestBody LabelTemplateSaveRequest request) {
        labelTemplateService.update(templateId, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{templateId}")
    @RequirePermission("label:template:delete")
    public ApiResponse<Void> delete(@PathVariable Long templateId) {
        labelTemplateService.delete(templateId);
        return ApiResponse.success();
    }

    @PostMapping("/{templateId}/release")
    @RequirePermission("label:template:save")
    public ApiResponse<Void> release(@PathVariable Long templateId) {
        labelTemplateService.release(templateId);
        return ApiResponse.success();
    }

    @PostMapping("/{templateId}/disable")
    @RequirePermission("label:template:save")
    public ApiResponse<Void> disable(@PathVariable Long templateId) {
        labelTemplateService.disable(templateId);
        return ApiResponse.success();
    }

    @PostMapping("/render")
    @RequirePermission("label:template:list")
    public ApiResponse<LabelRenderResponse> render(@RequestBody LabelRenderRequest request) {
        return ApiResponse.success(labelTemplateService.render(request));
    }
}
