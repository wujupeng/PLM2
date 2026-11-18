package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.FileQuery;
import com.huaweicloud.plm.system.dto.SysFilePreviewTaskSaveRequest;
import com.huaweicloud.plm.system.entity.SysFilePreviewTask;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysFilePreviewTaskService;
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

import java.util.Map;

/**
 * 预览转换任务接口（G1-N3 公共平台底座—统一文件服务 WBS T011）：转换任务登记与执行状态流转。
 */
@RestController
@RequestMapping("/platform/file/preview-tasks")
@RequiredArgsConstructor
public class SysFilePreviewTaskController {

    private final SysFilePreviewTaskService service;

    @GetMapping
    @RequirePermission("platform:file:preview:list")
    public ApiResponse<PageResult<SysFilePreviewTask>> page(FileQuery query) {
        return ApiResponse.success(service.pageTasks(query));
    }

    @GetMapping("/stats")
    @RequirePermission("platform:file:preview:list")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.success(service.stats());
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:file:preview:list")
    public ApiResponse<SysFilePreviewTask> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:file:preview:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SysFilePreviewTaskSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:file:preview:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SysFilePreviewTaskSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    /** 开始转换。 */
    @PostMapping("/{id}/start")
    @RequirePermission("platform:file:preview:manage")
    public ApiResponse<SysFilePreviewTask> start(@PathVariable Long id) {
        return ApiResponse.success(service.start(id));
    }

    /** 转换完成。 */
    @PostMapping("/{id}/complete")
    @RequirePermission("platform:file:preview:manage")
    public ApiResponse<SysFilePreviewTask> complete(@PathVariable Long id) {
        return ApiResponse.success(service.complete(id));
    }

    /** 转换失败。 */
    @PostMapping("/{id}/fail")
    @RequirePermission("platform:file:preview:manage")
    public ApiResponse<SysFilePreviewTask> fail(@PathVariable Long id) {
        return ApiResponse.success(service.fail(id));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:file:preview:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
