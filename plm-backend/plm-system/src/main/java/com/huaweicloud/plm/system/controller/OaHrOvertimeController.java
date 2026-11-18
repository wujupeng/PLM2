package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.HrFlowQuery;
import com.huaweicloud.plm.system.dto.HrOvertimeSaveRequest;
import com.huaweicloud.plm.system.entity.OaHrOvertime;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaHrOvertimeService;
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
 * 加班申请接口（OA-DEV-054）：列表、详情、保存并提交、撤回与删除。
 */
@RestController
@RequestMapping("/oa/hr/overtimes")
@RequiredArgsConstructor
public class OaHrOvertimeController {

    private final OaHrOvertimeService overtimeService;

    @GetMapping
    @RequirePermission("oa:hr:list")
    public ApiResponse<PageResult<OaHrOvertime>> page(HrFlowQuery query) {
        return ApiResponse.success(overtimeService.page(query, query.getApplicantUserId()));
    }

    @GetMapping("/{id}")
    @RequirePermission("oa:hr:list")
    public ApiResponse<OaHrOvertime> detail(@PathVariable Long id) {
        return ApiResponse.success(overtimeService.detail(id));
    }

    @PostMapping
    @RequirePermission("oa:hr:apply")
    public ApiResponse<Long> create(@Valid @RequestBody HrOvertimeSaveRequest request) {
        return ApiResponse.success(overtimeService.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("oa:hr:apply")
    public ApiResponse<Void> update(@PathVariable Long id, @Valid @RequestBody HrOvertimeSaveRequest request) {
        overtimeService.save(id, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{id}")
    @RequirePermission("oa:hr:apply")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        overtimeService.delete(id);
        return ApiResponse.success();
    }

    @PutMapping("/{id}/cancel")
    @RequirePermission("oa:hr:apply")
    public ApiResponse<Void> cancel(@PathVariable Long id) {
        overtimeService.withdraw(id);
        return ApiResponse.success();
    }
}
