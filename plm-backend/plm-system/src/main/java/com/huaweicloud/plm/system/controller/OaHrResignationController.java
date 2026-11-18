package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.HrFlowQuery;
import com.huaweicloud.plm.system.dto.HrResignationSaveRequest;
import com.huaweicloud.plm.system.entity.OaHrResignation;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaHrResignationService;
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
 * 离职申请接口（OA-DEV-055）：交接清单、多部门会签，审批通过后按配置联动停用账号并保留历史责任链。
 */
@RestController
@RequestMapping("/oa/hr/resignations")
@RequiredArgsConstructor
public class OaHrResignationController {

    private final OaHrResignationService resignationService;

    @GetMapping
    @RequirePermission("oa:hr:list")
    public ApiResponse<PageResult<OaHrResignation>> page(HrFlowQuery query) {
        return ApiResponse.success(resignationService.page(query, query.getApplicantUserId()));
    }

    @GetMapping("/{id}")
    @RequirePermission("oa:hr:list")
    public ApiResponse<OaHrResignation> detail(@PathVariable Long id) {
        return ApiResponse.success(resignationService.detail(id));
    }

    @PostMapping
    @RequirePermission("oa:hr:apply")
    public ApiResponse<Long> create(@Valid @RequestBody HrResignationSaveRequest request) {
        return ApiResponse.success(resignationService.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("oa:hr:apply")
    public ApiResponse<Void> update(@PathVariable Long id, @Valid @RequestBody HrResignationSaveRequest request) {
        resignationService.save(id, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{id}")
    @RequirePermission("oa:hr:apply")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        resignationService.delete(id);
        return ApiResponse.success();
    }

    @PutMapping("/{id}/cancel")
    @RequirePermission("oa:hr:apply")
    public ApiResponse<Void> cancel(@PathVariable Long id) {
        resignationService.withdraw(id);
        return ApiResponse.success();
    }
}
