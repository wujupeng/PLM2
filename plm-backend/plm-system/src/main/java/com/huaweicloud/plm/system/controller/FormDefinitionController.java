package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.FormDefinitionQuery;
import com.huaweicloud.plm.system.dto.FormDefinitionSaveRequest;
import com.huaweicloud.plm.system.dto.FormDetailResponse;
import com.huaweicloud.plm.system.entity.OaFormDefinition;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.FormDefinitionService;
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

@RestController
@RequestMapping("/oa/forms")
@RequiredArgsConstructor
public class FormDefinitionController {

    private final FormDefinitionService formDefinitionService;

    @GetMapping
    @RequirePermission("oa:form:list")
    public ApiResponse<PageResult<OaFormDefinition>> page(FormDefinitionQuery query) {
        return ApiResponse.success(formDefinitionService.page(query));
    }

    /** 供流程设计器与发起页选择表单，仅返回已发布表单。 */
    @GetMapping("/published")
    @RequirePermission("oa:form:list")
    public ApiResponse<List<OaFormDefinition>> listPublished() {
        return ApiResponse.success(formDefinitionService.listPublished());
    }

    @GetMapping("/{formId}")
    @RequirePermission("oa:form:list")
    public ApiResponse<FormDetailResponse> detail(@PathVariable Long formId) {
        return ApiResponse.success(formDefinitionService.getDetail(formId));
    }

    @PostMapping
    @RequirePermission("oa:form:save")
    public ApiResponse<Long> create(@Valid @RequestBody FormDefinitionSaveRequest request) {
        return ApiResponse.success(formDefinitionService.create(request));
    }

    @PutMapping("/{formId}")
    @RequirePermission("oa:form:save")
    public ApiResponse<Void> update(@PathVariable Long formId,
                                    @Valid @RequestBody FormDefinitionSaveRequest request) {
        formDefinitionService.update(formId, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{formId}")
    @RequirePermission("oa:form:delete")
    public ApiResponse<Void> delete(@PathVariable Long formId) {
        formDefinitionService.delete(formId);
        return ApiResponse.success();
    }

    @PutMapping("/{formId}/publish")
    @RequirePermission("oa:form:publish")
    public ApiResponse<Void> publish(@PathVariable Long formId) {
        formDefinitionService.publish(formId);
        return ApiResponse.success();
    }
}
