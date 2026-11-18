package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MesKanbanDowntimeQuery;
import com.huaweicloud.plm.system.dto.MesKanbanDowntimeSaveRequest;
import com.huaweicloud.plm.system.entity.MesKanbanDowntime;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MesKanbanDowntimeService;
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
 * 停机看板接口：停机登记、分页查询与删除。
 */
@RestController
@RequestMapping("/mes/kanban/downtimes")
@RequiredArgsConstructor
public class MesKanbanDowntimeController {

    private final MesKanbanDowntimeService service;

    @GetMapping
    @RequirePermission("mes:kanban:downtime:list")
    public ApiResponse<PageResult<MesKanbanDowntime>> page(MesKanbanDowntimeQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("mes:kanban:downtime:list")
    public ApiResponse<MesKanbanDowntime> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("mes:kanban:downtime:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MesKanbanDowntimeSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("mes:kanban:downtime:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody MesKanbanDowntimeSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("mes:kanban:downtime:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
