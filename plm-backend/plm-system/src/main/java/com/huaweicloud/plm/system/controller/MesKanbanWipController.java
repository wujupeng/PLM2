package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MesKanbanWipQuery;
import com.huaweicloud.plm.system.dto.MesKanbanWipSaveRequest;
import com.huaweicloud.plm.system.entity.MesKanbanWip;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MesKanbanWipService;
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
 * 在制品看板接口：在制品登记、分页查询与删除。
 */
@RestController
@RequestMapping("/mes/kanban/wips")
@RequiredArgsConstructor
public class MesKanbanWipController {

    private final MesKanbanWipService service;

    @GetMapping
    @RequirePermission("mes:kanban:wip:list")
    public ApiResponse<PageResult<MesKanbanWip>> page(MesKanbanWipQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("mes:kanban:wip:list")
    public ApiResponse<MesKanbanWip> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("mes:kanban:wip:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MesKanbanWipSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("mes:kanban:wip:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody MesKanbanWipSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("mes:kanban:wip:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
