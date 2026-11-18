package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.HrFlowQuery;
import com.huaweicloud.plm.system.dto.HrLeaveSaveRequest;
import com.huaweicloud.plm.system.entity.OaHrLeave;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaHrLeaveService;
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
 * 请假申请接口（OA-DEV-054）：列表、详情、保存并提交、撤回与删除。
 */
@RestController
@RequestMapping("/oa/hr/leaves")
@RequiredArgsConstructor
public class OaHrLeaveController {

    private final OaHrLeaveService leaveService;

    /** 请假单分页：传入 applicantUserId 时仅返回该申请人的单据。 */
    @GetMapping
    @RequirePermission("oa:hr:list")
    public ApiResponse<PageResult<OaHrLeave>> page(HrFlowQuery query) {
        return ApiResponse.success(leaveService.page(query, query.getApplicantUserId()));
    }

    @GetMapping("/{id}")
    @RequirePermission("oa:hr:list")
    public ApiResponse<OaHrLeave> detail(@PathVariable Long id) {
        return ApiResponse.success(leaveService.detail(id));
    }

    @PostMapping
    @RequirePermission("oa:hr:apply")
    public ApiResponse<Long> create(@Valid @RequestBody HrLeaveSaveRequest request) {
        return ApiResponse.success(leaveService.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("oa:hr:apply")
    public ApiResponse<Void> update(@PathVariable Long id, @Valid @RequestBody HrLeaveSaveRequest request) {
        leaveService.save(id, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{id}")
    @RequirePermission("oa:hr:apply")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        leaveService.delete(id);
        return ApiResponse.success();
    }

    /** 撤回：仅流程审批中的单据可撤回。 */
    @PutMapping("/{id}/cancel")
    @RequirePermission("oa:hr:apply")
    public ApiResponse<Void> cancel(@PathVariable Long id) {
        leaveService.withdraw(id);
        return ApiResponse.success();
    }
}
