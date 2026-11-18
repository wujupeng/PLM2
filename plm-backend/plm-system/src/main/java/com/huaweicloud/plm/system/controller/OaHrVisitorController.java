package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.HrFlowQuery;
import com.huaweicloud.plm.system.dto.HrVisitorSaveRequest;
import com.huaweicloud.plm.system.entity.OaHrVisitor;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaHrVisitorService;
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
 * 访客申请接口（OA-DEV-056）：访客数据仅授权人员可见，支持审批通过后签到与签退登记。
 */
@RestController
@RequestMapping("/oa/hr/visitors")
@RequiredArgsConstructor
public class OaHrVisitorController {

    private final OaHrVisitorService visitorService;

    @GetMapping
    @RequirePermission("oa:hr:list")
    public ApiResponse<PageResult<OaHrVisitor>> page(HrFlowQuery query) {
        return ApiResponse.success(visitorService.page(query, query.getApplicantUserId()));
    }

    @GetMapping("/{id}")
    @RequirePermission("oa:hr:list")
    public ApiResponse<OaHrVisitor> detail(@PathVariable Long id) {
        return ApiResponse.success(visitorService.detail(id));
    }

    @PostMapping
    @RequirePermission("oa:hr:apply")
    public ApiResponse<Long> create(@Valid @RequestBody HrVisitorSaveRequest request) {
        return ApiResponse.success(visitorService.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("oa:hr:apply")
    public ApiResponse<Void> update(@PathVariable Long id, @Valid @RequestBody HrVisitorSaveRequest request) {
        visitorService.save(id, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{id}")
    @RequirePermission("oa:hr:apply")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        visitorService.delete(id);
        return ApiResponse.success();
    }

    @PutMapping("/{id}/cancel")
    @RequirePermission("oa:hr:apply")
    public ApiResponse<Void> cancel(@PathVariable Long id) {
        visitorService.withdraw(id);
        return ApiResponse.success();
    }

    /** 访客签到：仅审批通过且未签到的访客单可签到。 */
    @PutMapping("/{id}/checkin")
    @RequirePermission("oa:hr:apply")
    public ApiResponse<Void> checkin(@PathVariable Long id) {
        visitorService.checkin(id);
        return ApiResponse.success();
    }

    /** 访客签退：仅已签到的访客单可签退。 */
    @PutMapping("/{id}/checkout")
    @RequirePermission("oa:hr:apply")
    public ApiResponse<Void> checkout(@PathVariable Long id) {
        visitorService.checkout(id);
        return ApiResponse.success();
    }
}
