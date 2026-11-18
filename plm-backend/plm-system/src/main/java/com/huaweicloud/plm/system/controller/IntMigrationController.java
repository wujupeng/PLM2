package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IntMigrationExceptionHandleRequest;
import com.huaweicloud.plm.system.dto.IntMigrationExceptionQuery;
import com.huaweicloud.plm.system.dto.IntMigrationTaskQuery;
import com.huaweicloud.plm.system.dto.IntMigrationTaskSaveRequest;
import com.huaweicloud.plm.system.entity.IntMigrationException;
import com.huaweicloud.plm.system.entity.IntMigrationTask;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.IntMigrationTaskService;
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

/** 数据迁移任务接口（N9，DEV-098）。 */
@RestController
@RequestMapping("/int/migrations")
@RequiredArgsConstructor
public class IntMigrationController {

    private final IntMigrationTaskService intMigrationTaskService;

    @GetMapping
    @RequirePermission("int:migration:list")
    public ApiResponse<PageResult<IntMigrationTask>> page(IntMigrationTaskQuery query) {
        return ApiResponse.success(intMigrationTaskService.page(query));
    }

    @GetMapping("/exceptions")
    @RequirePermission("int:migration:exception:list")
    public ApiResponse<PageResult<IntMigrationException>> exceptionPage(IntMigrationExceptionQuery query) {
        return ApiResponse.success(intMigrationTaskService.exceptionPage(query));
    }

    @GetMapping("/{taskNo}")
    @RequirePermission("int:migration:list")
    public ApiResponse<IntMigrationTask> detail(@PathVariable String taskNo) {
        return ApiResponse.success(intMigrationTaskService.require(taskNo));
    }

    @PostMapping
    @RequirePermission("int:migration:run")
    public ApiResponse<String> create(@Valid @RequestBody IntMigrationTaskSaveRequest request) {
        return ApiResponse.success(intMigrationTaskService.create(request));
    }

    @PutMapping("/{taskNo}")
    @RequirePermission("int:migration:run")
    public ApiResponse<Void> update(@PathVariable String taskNo,
                                    @Valid @RequestBody IntMigrationTaskSaveRequest request) {
        intMigrationTaskService.update(taskNo, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{taskNo}")
    @RequirePermission("int:migration:run")
    public ApiResponse<Void> delete(@PathVariable String taskNo) {
        intMigrationTaskService.delete(taskNo);
        return ApiResponse.success();
    }

    @PostMapping("/{taskNo}/run")
    @RequirePermission("int:migration:run")
    public ApiResponse<IntMigrationTask> run(@PathVariable String taskNo) {
        return ApiResponse.success(intMigrationTaskService.run(taskNo));
    }

    @PostMapping("/{taskNo}/verify")
    @RequirePermission("int:migration:verify")
    public ApiResponse<IntMigrationTask> verify(@PathVariable String taskNo) {
        return ApiResponse.success(intMigrationTaskService.verify(taskNo));
    }

    @PostMapping("/exceptions/{id}/handle")
    @RequirePermission("int:migration:exception:handle")
    public ApiResponse<IntMigrationException> exceptionHandle(
            @PathVariable Long id, @Valid @RequestBody IntMigrationExceptionHandleRequest request) {
        return ApiResponse.success(intMigrationTaskService.exceptionHandle(id, request));
    }
}
