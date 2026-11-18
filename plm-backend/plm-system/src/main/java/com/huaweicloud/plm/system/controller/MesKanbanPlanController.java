package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MesKanbanPlanQuery;
import com.huaweicloud.plm.system.dto.MesKanbanPlanSaveRequest;
import com.huaweicloud.plm.system.entity.MesKanbanPlan;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MesKanbanPlanService;
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
 * 计划达成接口：计划达成登记、分页查询与删除。
 */
@RestController
@RequestMapping("/mes/kanban/plans")
@RequiredArgsConstructor
public class MesKanbanPlanController {

    private final MesKanbanPlanService service;

    @GetMapping
    @RequirePermission("mes:kanban:plan:list")
    public ApiResponse<PageResult<MesKanbanPlan>> page(MesKanbanPlanQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("mes:kanban:plan:list")
    public ApiResponse<MesKanbanPlan> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("mes:kanban:plan:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MesKanbanPlanSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("mes:kanban:plan:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody MesKanbanPlanSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("mes:kanban:plan:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
