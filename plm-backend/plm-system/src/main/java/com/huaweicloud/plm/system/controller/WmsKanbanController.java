package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.WmsKanbanPullRequest;
import com.huaweicloud.plm.system.dto.WmsKanbanQuery;
import com.huaweicloud.plm.system.dto.WmsKanbanSaveRequest;
import com.huaweicloud.plm.system.entity.WmsDeliveryTask;
import com.huaweicloud.plm.system.entity.WmsKanban;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.WmsKanbanService;
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
 * 电子看板 Kanban 接口（N7，DEV-076）。
 */
@RestController
@RequestMapping("/wms/kanbans")
@RequiredArgsConstructor
public class WmsKanbanController {

    private final WmsKanbanService wmsKanbanService;

    @GetMapping
    @RequirePermission("wms:kanban:list")
    public ApiResponse<PageResult<WmsKanban>> page(WmsKanbanQuery query) {
        return ApiResponse.success(wmsKanbanService.page(query));
    }

    @GetMapping("/{kanbanNo}")
    @RequirePermission("wms:kanban:list")
    public ApiResponse<WmsKanban> detail(@PathVariable String kanbanNo) {
        return ApiResponse.success(wmsKanbanService.requireKanban(kanbanNo));
    }

    @PostMapping
    @RequirePermission("wms:kanban:save")
    public ApiResponse<Long> create(@Valid @RequestBody WmsKanbanSaveRequest request) {
        return ApiResponse.success(wmsKanbanService.create(request));
    }

    @PutMapping("/{kanbanNo}")
    @RequirePermission("wms:kanban:save")
    public ApiResponse<Void> update(@PathVariable String kanbanNo,
                                    @Valid @RequestBody WmsKanbanSaveRequest request) {
        wmsKanbanService.update(kanbanNo, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{kanbanNo}")
    @RequirePermission("wms:kanban:save")
    public ApiResponse<Void> delete(@PathVariable String kanbanNo) {
        wmsKanbanService.delete(kanbanNo);
        return ApiResponse.success();
    }

    @PostMapping("/{kanbanNo}/pull")
    @RequirePermission("wms:kanban:pull")
    public ApiResponse<WmsDeliveryTask> pull(@PathVariable String kanbanNo,
                                             @Valid @RequestBody WmsKanbanPullRequest request) {
        return ApiResponse.success(wmsKanbanService.pull(kanbanNo, request));
    }
}
