package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IntExportTaskQuery;
import com.huaweicloud.plm.system.dto.IntExportTaskSaveRequest;
import com.huaweicloud.plm.system.entity.IntExportTask;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.IntExportTaskService;
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
 * 数据导出与退出接口（N9，DEV-099）：导出主数据、BOM、追溯数据与附件索引，支持 CSV/EXCEL/JSON。
 */
@RestController
@RequestMapping("/int/export-tasks")
@RequiredArgsConstructor
public class IntExportTaskController {

    private final IntExportTaskService intExportTaskService;

    @GetMapping
    @RequirePermission("int:export:list")
    public ApiResponse<PageResult<IntExportTask>> page(IntExportTaskQuery query) {
        return ApiResponse.success(intExportTaskService.page(query));
    }

    @GetMapping("/{taskNo}")
    @RequirePermission("int:export:list")
    public ApiResponse<IntExportTask> detail(@PathVariable String taskNo) {
        return ApiResponse.success(intExportTaskService.require(taskNo));
    }

    @PostMapping
    @RequirePermission("int:export:run")
    public ApiResponse<String> create(@Valid @RequestBody IntExportTaskSaveRequest request) {
        return ApiResponse.success(intExportTaskService.create(request));
    }

    @PutMapping("/{taskNo}")
    @RequirePermission("int:export:run")
    public ApiResponse<Void> update(@PathVariable String taskNo,
                                    @Valid @RequestBody IntExportTaskSaveRequest request) {
        intExportTaskService.update(taskNo, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{taskNo}")
    @RequirePermission("int:export:run")
    public ApiResponse<Void> delete(@PathVariable String taskNo) {
        intExportTaskService.delete(taskNo);
        return ApiResponse.success();
    }

    @PostMapping("/{taskNo}/run")
    @RequirePermission("int:export:run")
    public ApiResponse<IntExportTask> run(@PathVariable String taskNo) {
        return ApiResponse.success(intExportTaskService.run(taskNo));
    }
}
