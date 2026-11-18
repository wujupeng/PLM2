package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MesKanbanOutputQuery;
import com.huaweicloud.plm.system.dto.MesKanbanOutputSaveRequest;
import com.huaweicloud.plm.system.entity.MesKanbanOutput;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MesKanbanOutputService;
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
 * 产量看板接口：产量登记、分页查询与删除。
 */
@RestController
@RequestMapping("/mes/kanban/outputs")
@RequiredArgsConstructor
public class MesKanbanOutputController {

    private final MesKanbanOutputService service;

    @GetMapping
    @RequirePermission("mes:kanban:output:list")
    public ApiResponse<PageResult<MesKanbanOutput>> page(MesKanbanOutputQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("mes:kanban:output:list")
    public ApiResponse<MesKanbanOutput> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("mes:kanban:output:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MesKanbanOutputSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("mes:kanban:output:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody MesKanbanOutputSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("mes:kanban:output:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
