package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.WorkReportQuery;
import com.huaweicloud.plm.system.dto.WorkReportSaveRequest;
import com.huaweicloud.plm.system.entity.OaOaWorkReport;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaWorkReportService;
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
 * 工作汇报接口（OA-DEV-060）：日报、周报、月报的维护与已读标记。
 */
@RestController
@RequestMapping("/oa/work-reports")
@RequiredArgsConstructor
public class OaWorkReportController {

    private final OaWorkReportService workReportService;

    /** 工作汇报分页：传入 reporterUserId 时仅返回该汇报人的记录。 */
    @GetMapping
    @RequirePermission("oa:collab:report")
    public ApiResponse<PageResult<OaOaWorkReport>> page(WorkReportQuery query) {
        return ApiResponse.success(workReportService.page(query, query.getReporterUserId()));
    }

    @GetMapping("/{id}")
    @RequirePermission("oa:collab:report")
    public ApiResponse<OaOaWorkReport> detail(@PathVariable Long id) {
        return ApiResponse.success(workReportService.detail(id));
    }

    @PostMapping
    @RequirePermission("oa:collab:report")
    public ApiResponse<Long> create(@Valid @RequestBody WorkReportSaveRequest request) {
        return ApiResponse.success(workReportService.create(request));
    }

    @PutMapping("/{id}")
    @RequirePermission("oa:collab:report")
    public ApiResponse<Void> update(@PathVariable Long id, @Valid @RequestBody WorkReportSaveRequest request) {
        workReportService.update(id, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{id}")
    @RequirePermission("oa:collab:report")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        workReportService.delete(id);
        return ApiResponse.success();
    }

    /** 标记已读。 */
    @PutMapping("/{id}/read")
    @RequirePermission("oa:collab:report")
    public ApiResponse<Void> markRead(@PathVariable Long id) {
        workReportService.markRead(id);
        return ApiResponse.success();
    }
}
