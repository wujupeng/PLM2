package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MesLaborHourQuery;
import com.huaweicloud.plm.system.dto.MesLaborHourSaveRequest;
import com.huaweicloud.plm.system.entity.MesLaborHour;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MesLaborHourService;
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
 * MES 工时记录接口：工时登记、分页查询与删除。
 */
@RestController
@RequestMapping("/mes/report/labors")
@RequiredArgsConstructor
public class MesLaborHourController {

    private final MesLaborHourService service;

    @GetMapping
    @RequirePermission("mes:report:labor:list")
    public ApiResponse<PageResult<MesLaborHour>> page(@Valid MesLaborHourQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("mes:report:labor:list")
    public ApiResponse<MesLaborHour> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("mes:report:labor:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MesLaborHourSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("mes:report:labor:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody MesLaborHourSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("mes:report:labor:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
