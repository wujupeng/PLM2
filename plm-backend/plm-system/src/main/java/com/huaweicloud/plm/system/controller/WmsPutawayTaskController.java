package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.WmsPutawayTaskQuery;
import com.huaweicloud.plm.system.dto.WmsPutawayTaskSaveRequest;
import com.huaweicloud.plm.system.entity.WmsPutawayTask;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.WmsPutawayTaskService;
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
 * 上架任务接口（对应上架任务）：
 * 上架任务登记、分页查询与删除。
 */
@RestController
@RequestMapping("/wms/inbound/putaways")
@RequiredArgsConstructor
public class WmsPutawayTaskController {

    private final WmsPutawayTaskService service;

    @GetMapping
    @RequirePermission("wms:inbound:putaway:list")
    public ApiResponse<PageResult<WmsPutawayTask>> page(WmsPutawayTaskQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("wms:inbound:putaway:list")
    public ApiResponse<WmsPutawayTask> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("wms:inbound:putaway:manage")
    public ApiResponse<Long> create(@Valid @RequestBody WmsPutawayTaskSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("wms:inbound:putaway:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody WmsPutawayTaskSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("wms:inbound:putaway:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
