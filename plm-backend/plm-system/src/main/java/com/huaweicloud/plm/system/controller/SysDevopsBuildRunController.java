package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.DevopsBuildRunQuery;
import com.huaweicloud.plm.system.dto.DevopsBuildRunSaveRequest;
import com.huaweicloud.plm.system.entity.SysDevopsBuildRun;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysDevopsBuildRunService;
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
 * 构建部署记录接口（G1-N7 公共平台底座—DevSecOps WBS T012）：
 * 构建运行记录、分页查询与删除。
 */
@RestController
@RequestMapping("/platform/devops/build-runs")
@RequiredArgsConstructor
public class SysDevopsBuildRunController {

    private final SysDevopsBuildRunService service;

    @GetMapping
    @RequirePermission("platform:devops:buildrun:list")
    public ApiResponse<PageResult<SysDevopsBuildRun>> page(DevopsBuildRunQuery query) {
        return ApiResponse.success(service.pageBuildRuns(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:devops:buildrun:list")
    public ApiResponse<SysDevopsBuildRun> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:devops:buildrun:manage")
    public ApiResponse<Long> create(@Valid @RequestBody DevopsBuildRunSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:devops:buildrun:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody DevopsBuildRunSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:devops:buildrun:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
