package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.OaTestQuery;
import com.huaweicloud.plm.system.dto.OaUatRecordSaveRequest;
import com.huaweicloud.plm.system.entity.OaUatRecord;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaUatRecordService;
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
 * 用户验收（UAT）记录接口（OA-DEV-111）：验收场景、参与人、预期与实际结果与验收结论。
 */
@RestController
@RequestMapping("/oa/test/uat-records")
@RequiredArgsConstructor
public class OaUatRecordController {

    private final OaUatRecordService service;

    @GetMapping
    @RequirePermission("oa:test:uat:list")
    public ApiResponse<PageResult<OaUatRecord>> page(OaTestQuery query) {
        return ApiResponse.success(service.pageUatRecords(query));
    }

    @GetMapping("/stats")
    @RequirePermission("oa:test:uat:list")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.success(service.stats());
    }

    @GetMapping("/{id}")
    @RequirePermission("oa:test:uat:list")
    public ApiResponse<OaUatRecord> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("oa:test:uat:manage")
    public ApiResponse<Long> create(@Valid @RequestBody OaUatRecordSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("oa:test:uat:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody OaUatRecordSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("oa:test:uat:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }

    /** 登记验收结论。 */
    @PostMapping("/{id}/conclude")
    @RequirePermission("oa:test:uat:manage")
    public ApiResponse<OaUatRecord> conclude(@PathVariable Long id,
                                             @RequestParam(required = false) String uatStatus,
                                             @RequestParam(required = false) String conclusion) {
        return ApiResponse.success(service.conclude(id, uatStatus, conclusion));
    }
}
