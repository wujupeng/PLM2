package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MesKanbanAndonQuery;
import com.huaweicloud.plm.system.dto.MesKanbanAndonSaveRequest;
import com.huaweicloud.plm.system.entity.MesKanbanAndon;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MesKanbanAndonService;
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
 * 异常安灯接口：安灯登记、分页查询与删除。
 */
@RestController
@RequestMapping("/mes/kanban/andons")
@RequiredArgsConstructor
public class MesKanbanAndonController {

    private final MesKanbanAndonService service;

    @GetMapping
    @RequirePermission("mes:kanban:andon:list")
    public ApiResponse<PageResult<MesKanbanAndon>> page(MesKanbanAndonQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("mes:kanban:andon:list")
    public ApiResponse<MesKanbanAndon> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("mes:kanban:andon:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MesKanbanAndonSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("mes:kanban:andon:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody MesKanbanAndonSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("mes:kanban:andon:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
