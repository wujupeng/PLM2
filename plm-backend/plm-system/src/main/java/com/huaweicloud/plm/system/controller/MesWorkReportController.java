package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MesWorkReportQuery;
import com.huaweicloud.plm.system.dto.MesWorkReportSaveRequest;
import com.huaweicloud.plm.system.entity.MesWorkReport;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MesWorkReportService;
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
 * 工序报工单接口：报工任务登记、分页查询与删除。
 */
@RestController
@RequestMapping("/mes/report/works")
@RequiredArgsConstructor
public class MesWorkReportController {

    private final MesWorkReportService service;

    @GetMapping
    @RequirePermission("mes:report:work:list")
    public ApiResponse<PageResult<MesWorkReport>> page(MesWorkReportQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("mes:report:work:list")
    public ApiResponse<MesWorkReport> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("mes:report:work:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MesWorkReportSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("mes:report:work:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody MesWorkReportSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("mes:report:work:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
