package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.DataQualityExceptionHandleRequest;
import com.huaweicloud.plm.system.dto.DataQualityExceptionQuery;
import com.huaweicloud.plm.system.dto.SysDataQualityExceptionSaveRequest;
import com.huaweicloud.plm.system.entity.SysDataQualityException;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysDataQualityExceptionService;
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

import java.util.Map;

/**
 * 数据异常队列接口（G1-N6 公共平台底座—通用能力 WBS T105 数据质量控制）：
 * 异常入队登记、处理状态流转（处理中/已解决/已忽略）与统计。
 */
@RestController
@RequestMapping("/platform/data-quality/exceptions")
@RequiredArgsConstructor
public class SysDataQualityExceptionController {

    private final SysDataQualityExceptionService service;

    @GetMapping
    @RequirePermission("platform:dq:exception:list")
    public ApiResponse<PageResult<SysDataQualityException>> page(DataQualityExceptionQuery query) {
        return ApiResponse.success(service.pageExceptions(query));
    }

    @GetMapping("/stats")
    @RequirePermission("platform:dq:exception:list")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.success(service.stats());
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:dq:exception:list")
    public ApiResponse<SysDataQualityException> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:dq:exception:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SysDataQualityExceptionSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:dq:exception:manage")
    public ApiResponse<Long> update(@PathVariable Long id,
                                    @Valid @RequestBody SysDataQualityExceptionSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    /** 处理中：状态置为 HANDLING，处理人置为当前用户。 */
    @PostMapping("/{id}/handle")
    @RequirePermission("platform:dq:exception:manage")
    public ApiResponse<SysDataQualityException> handle(@PathVariable Long id) {
        return ApiResponse.success(service.handle(id));
    }

    /** 已解决：状态置为 RESOLVED，记录处理人、处理时间与处理说明（请求体可选）。 */
    @PostMapping("/{id}/resolve")
    @RequirePermission("platform:dq:exception:manage")
    public ApiResponse<SysDataQualityException> resolve(
            @PathVariable Long id,
            @RequestBody(required = false) DataQualityExceptionHandleRequest request) {
        String handleNote = request == null ? null : request.getHandleNote();
        return ApiResponse.success(service.resolve(id, handleNote));
    }

    /** 已忽略：状态置为 IGNORED，记录处理人与处理时间。 */
    @PostMapping("/{id}/ignore")
    @RequirePermission("platform:dq:exception:manage")
    public ApiResponse<SysDataQualityException> ignore(@PathVariable Long id) {
        return ApiResponse.success(service.ignore(id));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:dq:exception:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
