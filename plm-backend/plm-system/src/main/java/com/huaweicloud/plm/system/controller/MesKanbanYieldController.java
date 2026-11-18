package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MesKanbanYieldQuery;
import com.huaweicloud.plm.system.dto.MesKanbanYieldSaveRequest;
import com.huaweicloud.plm.system.entity.MesKanbanYield;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MesKanbanYieldService;
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
 * 良率看板接口：良率记录登记、分页查询与删除。
 */
@RestController
@RequestMapping("/mes/kanban/yields")
@RequiredArgsConstructor
public class MesKanbanYieldController {

    private final MesKanbanYieldService service;

    @GetMapping
    @RequirePermission("mes:kanban:yield:list")
    public ApiResponse<PageResult<MesKanbanYield>> page(MesKanbanYieldQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("mes:kanban:yield:list")
    public ApiResponse<MesKanbanYield> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("mes:kanban:yield:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MesKanbanYieldSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("mes:kanban:yield:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody MesKanbanYieldSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("mes:kanban:yield:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
