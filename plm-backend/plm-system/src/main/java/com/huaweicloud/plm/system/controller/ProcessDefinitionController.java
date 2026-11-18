package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ProcessDefinitionQuery;
import com.huaweicloud.plm.system.dto.ProcessDefinitionSaveRequest;
import com.huaweicloud.plm.system.dto.ProcessDetailResponse;
import com.huaweicloud.plm.system.entity.OaProcessDefinition;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ProcessDefinitionService;
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
@RequestMapping("/oa/processes")
@RequiredArgsConstructor
public class ProcessDefinitionController {

    private final ProcessDefinitionService processDefinitionService;

    @GetMapping
    @RequirePermission("oa:process:list")
    public ApiResponse<PageResult<OaProcessDefinition>> page(ProcessDefinitionQuery query) {
        return ApiResponse.success(processDefinitionService.page(query));
    }

    /** 供发起页选择流程，仅返回已发布流程。 */
    @GetMapping("/published")
    @RequirePermission("oa:process:list")
    public ApiResponse<List<OaProcessDefinition>> listPublished() {
        return ApiResponse.success(processDefinitionService.listPublished());
    }

    @GetMapping("/{processId}")
    @RequirePermission("oa:process:list")
    public ApiResponse<ProcessDetailResponse> detail(@PathVariable Long processId) {
        return ApiResponse.success(processDefinitionService.getDetail(processId));
    }

    @PostMapping
    @RequirePermission("oa:process:save")
    public ApiResponse<Long> create(@Valid @RequestBody ProcessDefinitionSaveRequest request) {
        return ApiResponse.success(processDefinitionService.create(request));
    }

    @PutMapping("/{processId}")
    @RequirePermission("oa:process:save")
    public ApiResponse<Void> update(@PathVariable Long processId,
                                    @Valid @RequestBody ProcessDefinitionSaveRequest request) {
        processDefinitionService.update(processId, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{processId}")
    @RequirePermission("oa:process:delete")
    public ApiResponse<Void> delete(@PathVariable Long processId) {
        processDefinitionService.delete(processId);
        return ApiResponse.success();
    }

    @PutMapping("/{processId}/publish")
    @RequirePermission("oa:process:publish")
    public ApiResponse<Void> publish(@PathVariable Long processId) {
        processDefinitionService.publish(processId);
        return ApiResponse.success();
    }
}
