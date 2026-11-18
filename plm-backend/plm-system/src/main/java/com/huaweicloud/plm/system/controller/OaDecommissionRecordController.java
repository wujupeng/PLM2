package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.OaDecommissionRecordSaveRequest;
import com.huaweicloud.plm.system.dto.OaGoliveQuery;
import com.huaweicloud.plm.system.entity.OaDecommissionRecord;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaDecommissionRecordService;
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
 * 完成授权和资源回收接口（OA-DEV-120）：原有 OA 账号授权撤销与资源回收审批、执行。
 */
@RestController
@RequestMapping("/oa/golive/decommissions")
@RequiredArgsConstructor
public class OaDecommissionRecordController {

    private final OaDecommissionRecordService service;

    @GetMapping
    @RequirePermission("oa:golive:decommission:list")
    public ApiResponse<PageResult<OaDecommissionRecord>> page(OaGoliveQuery query) {
        return ApiResponse.success(service.pageRecords(query));
    }

    @GetMapping("/stats")
    @RequirePermission("oa:golive:decommission:list")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.success(service.stats());
    }

    @GetMapping("/{id}")
    @RequirePermission("oa:golive:decommission:list")
    public ApiResponse<OaDecommissionRecord> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("oa:golive:decommission:manage")
    public ApiResponse<Long> create(@Valid @RequestBody OaDecommissionRecordSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("oa:golive:decommission:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody OaDecommissionRecordSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    /** 批准资源回收。 */
    @PostMapping("/{id}/approve")
    @RequirePermission("oa:golive:decommission:manage")
    public ApiResponse<OaDecommissionRecord> approve(@PathVariable Long id,
                                                     @RequestParam(required = false) String approver) {
        return ApiResponse.success(service.approve(id, approver));
    }

    /** 执行资源回收。 */
    @PostMapping("/{id}/execute")
    @RequirePermission("oa:golive:decommission:manage")
    public ApiResponse<OaDecommissionRecord> execute(@PathVariable Long id) {
        return ApiResponse.success(service.execute(id));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("oa:golive:decommission:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
