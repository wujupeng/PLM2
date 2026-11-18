package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.InstanceDetailResponse;
import com.huaweicloud.plm.system.dto.InstanceQuery;
import com.huaweicloud.plm.system.dto.ProcessStartRequest;
import com.huaweicloud.plm.system.entity.OaProcessInstance;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaProcessInstanceService;
import com.huaweicloud.plm.system.service.WorkflowEngineService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/oa/instances")
@RequiredArgsConstructor
public class ProcessInstanceController {

    private final OaProcessInstanceService instanceService;
    private final WorkflowEngineService workflowEngineService;

    /** 我的申请：仅查询当前登录用户发起的流程实例。 */
    @GetMapping("/my")
    @RequirePermission("oa:instance:start")
    public ApiResponse<PageResult<OaProcessInstance>> pageMine(InstanceQuery query) {
        return ApiResponse.success(instanceService.pageMine(query));
    }

    /** 流程监控：按条件查询全部流程实例。 */
    @GetMapping("/monitor")
    @RequirePermission("oa:instance:list")
    public ApiResponse<PageResult<OaProcessInstance>> pageMonitor(InstanceQuery query) {
        return ApiResponse.success(instanceService.pageMonitor(query));
    }

    @GetMapping("/{instanceId}")
    @RequirePermission("oa:instance:list")
    public ApiResponse<InstanceDetailResponse> detail(@PathVariable Long instanceId) {
        return ApiResponse.success(instanceService.getDetail(instanceId));
    }

    @PostMapping("/start")
    @RequirePermission("oa:instance:start")
    public ApiResponse<Long> start(@Valid @RequestBody ProcessStartRequest request) {
        return ApiResponse.success(workflowEngineService.start(request));
    }

    @PutMapping("/{instanceId}/cancel")
    @RequirePermission("oa:instance:cancel")
    public ApiResponse<Void> cancel(@PathVariable Long instanceId) {
        instanceService.cancel(instanceId);
        return ApiResponse.success();
    }
}
