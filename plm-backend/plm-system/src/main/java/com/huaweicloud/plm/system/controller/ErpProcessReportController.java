package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ErpProcessReportQuery;
import com.huaweicloud.plm.system.dto.ErpProcessReportSaveRequest;
import com.huaweicloud.plm.system.entity.ErpProcessReport;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ErpProcessReportService;
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
 * 工序报工接口（对应 G3-N7b ERP 工艺资源—工序报工）：
 * 报工记录登记、分页查询与删除。
 */
@RestController
@RequestMapping("/erp/process/reports")
@RequiredArgsConstructor
public class ErpProcessReportController {

    private final ErpProcessReportService service;

    @GetMapping
    @RequirePermission("erp:process:report:list")
    public ApiResponse<PageResult<ErpProcessReport>> page(ErpProcessReportQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("erp:process:report:list")
    public ApiResponse<ErpProcessReport> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("erp:process:report:manage")
    public ApiResponse<Long> create(@Valid @RequestBody ErpProcessReportSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("erp:process:report:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody ErpProcessReportSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("erp:process:report:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
