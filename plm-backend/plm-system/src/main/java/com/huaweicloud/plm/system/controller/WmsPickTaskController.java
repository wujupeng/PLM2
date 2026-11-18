package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.WmsPickTaskQuery;
import com.huaweicloud.plm.system.dto.WmsPickTaskSaveRequest;
import com.huaweicloud.plm.system.entity.WmsPickTask;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.WmsPickTaskService;
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
 * 拣料单接口：拣料任务登记、分页查询与删除。
 */
@RestController
@RequestMapping("/wms/pick/tasks")
@RequiredArgsConstructor
public class WmsPickTaskController {

    private final WmsPickTaskService service;

    @GetMapping
    @RequirePermission("wms:pick:task:list")
    public ApiResponse<PageResult<WmsPickTask>> page(WmsPickTaskQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("wms:pick:task:list")
    public ApiResponse<WmsPickTask> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("wms:pick:task:manage")
    public ApiResponse<Long> create(@Valid @RequestBody WmsPickTaskSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("wms:pick:task:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody WmsPickTaskSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("wms:pick:task:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
