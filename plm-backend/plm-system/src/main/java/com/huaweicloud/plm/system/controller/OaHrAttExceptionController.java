package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.HrAttExceptionSaveRequest;
import com.huaweicloud.plm.system.dto.HrFlowQuery;
import com.huaweicloud.plm.system.entity.OaHrAttendanceException;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaHrAttExceptionService;
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
 * 考勤异常处理接口（OA-DEV-057）：仅登记异常处理申请，不修改或替代权威考勤源的原始打卡数据。
 */
@RestController
@RequestMapping("/oa/hr/attendance-exceptions")
@RequiredArgsConstructor
public class OaHrAttExceptionController {

    private final OaHrAttExceptionService attExceptionService;

    @GetMapping
    @RequirePermission("oa:hr:list")
    public ApiResponse<PageResult<OaHrAttendanceException>> page(HrFlowQuery query) {
        return ApiResponse.success(attExceptionService.page(query, query.getApplicantUserId()));
    }

    @GetMapping("/{id}")
    @RequirePermission("oa:hr:list")
    public ApiResponse<OaHrAttendanceException> detail(@PathVariable Long id) {
        return ApiResponse.success(attExceptionService.detail(id));
    }

    @PostMapping
    @RequirePermission("oa:hr:apply")
    public ApiResponse<Long> create(@Valid @RequestBody HrAttExceptionSaveRequest request) {
        return ApiResponse.success(attExceptionService.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("oa:hr:apply")
    public ApiResponse<Void> update(@PathVariable Long id, @Valid @RequestBody HrAttExceptionSaveRequest request) {
        attExceptionService.save(id, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{id}")
    @RequirePermission("oa:hr:apply")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        attExceptionService.delete(id);
        return ApiResponse.success();
    }

    @PutMapping("/{id}/cancel")
    @RequirePermission("oa:hr:apply")
    public ApiResponse<Void> cancel(@PathVariable Long id) {
        attExceptionService.withdraw(id);
        return ApiResponse.success();
    }
}
