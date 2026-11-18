package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.EmploymentQuery;
import com.huaweicloud.plm.system.dto.EmploymentSaveRequest;
import com.huaweicloud.plm.system.entity.SysEmployment;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.EmploymentService;
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

@RestController
@RequestMapping("/oa/employments")
@RequiredArgsConstructor
public class EmploymentController {

    private final EmploymentService employmentService;

    @GetMapping
    @RequirePermission("oa:employment:list")
    public ApiResponse<PageResult<SysEmployment>> page(EmploymentQuery query) {
        return ApiResponse.success(employmentService.page(query));
    }

    @PostMapping
    @RequirePermission("oa:employment:save")
    public ApiResponse<Long> create(@Valid @RequestBody EmploymentSaveRequest request) {
        return ApiResponse.success(employmentService.create(request));
    }

    @PutMapping("/{employmentId}")
    @RequirePermission("oa:employment:save")
    public ApiResponse<Void> update(@PathVariable Long employmentId,
                                    @Valid @RequestBody EmploymentSaveRequest request) {
        employmentService.update(employmentId, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{employmentId}")
    @RequirePermission("oa:employment:delete")
    public ApiResponse<Void> delete(@PathVariable Long employmentId) {
        employmentService.delete(employmentId);
        return ApiResponse.success();
    }
}
