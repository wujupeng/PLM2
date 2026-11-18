package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.SysMdmCodeIssueQuery;
import com.huaweicloud.plm.system.dto.SysMdmCodeIssueSaveRequest;
import com.huaweicloud.plm.system.entity.SysMdmCodeIssue;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysMdmCodeIssueService;
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
 * 主数据编码发放接口（G1-N8 公共平台底座 WBS T007 主数据平台）：
 * 编码发放登记、分页查询与删除。
 */
@RestController
@RequestMapping("/platform/mdm/code-issues")
@RequiredArgsConstructor
public class SysMdmCodeIssueController {

    private final SysMdmCodeIssueService service;

    @GetMapping
    @RequirePermission("platform:mdm:codeissue:list")
    public ApiResponse<PageResult<SysMdmCodeIssue>> page(SysMdmCodeIssueQuery query) {
        return ApiResponse.success(service.pageCodeIssues(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:mdm:codeissue:list")
    public ApiResponse<SysMdmCodeIssue> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:mdm:codeissue:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SysMdmCodeIssueSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:mdm:codeissue:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SysMdmCodeIssueSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:mdm:codeissue:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
