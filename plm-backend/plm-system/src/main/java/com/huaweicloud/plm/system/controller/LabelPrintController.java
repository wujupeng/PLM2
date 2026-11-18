package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.LabelPrintLogQuery;
import com.huaweicloud.plm.system.dto.LabelPrintQuery;
import com.huaweicloud.plm.system.dto.LabelPrintRequest;
import com.huaweicloud.plm.system.dto.LabelReprintRequest;
import com.huaweicloud.plm.system.entity.LabelPrintLog;
import com.huaweicloud.plm.system.entity.LabelPrintTask;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.LabelPrintService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 标签打印与补打接口（N5）。
 */
@RestController
@RequestMapping("/label/prints")
@RequiredArgsConstructor
public class LabelPrintController {

    private final LabelPrintService labelPrintService;

    @GetMapping
    @RequirePermission("label:print:log")
    public ApiResponse<PageResult<LabelPrintTask>> page(LabelPrintQuery query) {
        return ApiResponse.success(labelPrintService.page(query));
    }

    @GetMapping("/logs")
    @RequirePermission("label:print:log")
    public ApiResponse<PageResult<LabelPrintLog>> pageLogs(LabelPrintLogQuery query) {
        return ApiResponse.success(labelPrintService.pageLogs(query));
    }

    @GetMapping("/{taskId}")
    @RequirePermission("label:print:log")
    public ApiResponse<LabelPrintTask> detail(@PathVariable Long taskId) {
        return ApiResponse.success(labelPrintService.detail(taskId));
    }

    @GetMapping("/{taskId}/logs")
    @RequirePermission("label:print:log")
    public ApiResponse<List<LabelPrintLog>> listLogsByTask(@PathVariable Long taskId) {
        return ApiResponse.success(labelPrintService.listLogsByTask(taskId));
    }

    @PostMapping
    @RequirePermission("label:print")
    public ApiResponse<Long> print(@Valid @RequestBody LabelPrintRequest request) {
        return ApiResponse.success(labelPrintService.print(request));
    }

    @PostMapping("/batch")
    @RequirePermission("label:print")
    public ApiResponse<List<Long>> printBatch(@RequestBody List<LabelPrintRequest> requests) {
        return ApiResponse.success(labelPrintService.printBatch(requests));
    }

    @PostMapping("/{taskId}/reprint")
    @RequirePermission("label:reprint")
    public ApiResponse<Long> reprint(@PathVariable Long taskId, @RequestBody LabelReprintRequest request) {
        return ApiResponse.success(labelPrintService.reprint(taskId, request));
    }

    @PostMapping("/{taskId}/void")
    @RequirePermission("label:reprint")
    public ApiResponse<Void> voidTask(@PathVariable Long taskId,
                                      @RequestParam(required = false) String reason) {
        labelPrintService.voidTask(taskId, reason);
        return ApiResponse.success();
    }
}
