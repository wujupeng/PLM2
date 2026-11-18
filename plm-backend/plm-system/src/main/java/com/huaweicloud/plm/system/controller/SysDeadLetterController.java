package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IntegrationQuery;
import com.huaweicloud.plm.system.dto.SysDeadLetterSaveRequest;
import com.huaweicloud.plm.system.entity.SysDeadLetter;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysDeadLetterService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * 死信队列接口（G1-N1 集成平台 WBS T009）：投递失败事件的人工处理、忽略与重投。
 */
@RestController
@RequestMapping("/platform/integration/dead-letters")
@RequiredArgsConstructor
public class SysDeadLetterController {

    private final SysDeadLetterService service;

    @GetMapping
    @RequirePermission("platform:integration:deadletter:list")
    public ApiResponse<PageResult<SysDeadLetter>> page(IntegrationQuery query) {
        return ApiResponse.success(service.pageDeadLetters(query));
    }

    @GetMapping("/stats")
    @RequirePermission("platform:integration:deadletter:list")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.success(service.stats());
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:integration:deadletter:list")
    public ApiResponse<SysDeadLetter> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:integration:deadletter:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SysDeadLetterSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:integration:deadletter:manage")
    public ApiResponse<Long> update(@PathVariable Long id,
                                    @Valid @RequestBody SysDeadLetterSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    /** 人工处理死信。 */
    @PostMapping("/{id}/handle")
    @RequirePermission("platform:integration:deadletter:manage")
    public ApiResponse<SysDeadLetter> handle(@PathVariable Long id,
                                             @RequestParam(required = false) String handleResult,
                                             @RequestParam(required = false) String handlerName) {
        return ApiResponse.success(service.handle(id, handleResult, handlerName));
    }

    /** 忽略死信。 */
    @PostMapping("/{id}/ignore")
    @RequirePermission("platform:integration:deadletter:manage")
    public ApiResponse<SysDeadLetter> ignore(@PathVariable Long id) {
        return ApiResponse.success(service.ignore(id));
    }

    /** 重投死信。 */
    @PostMapping("/{id}/retry")
    @RequirePermission("platform:integration:deadletter:manage")
    public ApiResponse<SysDeadLetter> retry(@PathVariable Long id) {
        return ApiResponse.success(service.retry(id));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:integration:deadletter:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
