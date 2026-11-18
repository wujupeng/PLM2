package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.DevopsPipelineQuery;
import com.huaweicloud.plm.system.dto.DevopsPipelineSaveRequest;
import com.huaweicloud.plm.system.entity.SysDevopsPipeline;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysDevopsPipelineService;
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
 * 流水线接口（G1-N7 公共平台底座—DevSecOps WBS T012）：
 * 流水线登记、分页查询与删除。
 */
@RestController
@RequestMapping("/platform/devops/pipelines")
@RequiredArgsConstructor
public class SysDevopsPipelineController {

    private final SysDevopsPipelineService service;

    @GetMapping
    @RequirePermission("platform:devops:pipeline:list")
    public ApiResponse<PageResult<SysDevopsPipeline>> page(DevopsPipelineQuery query) {
        return ApiResponse.success(service.pagePipelines(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:devops:pipeline:list")
    public ApiResponse<SysDevopsPipeline> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:devops:pipeline:manage")
    public ApiResponse<Long> create(@Valid @RequestBody DevopsPipelineSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:devops:pipeline:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody DevopsPipelineSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:devops:pipeline:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
