package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IntegrationQuery;
import com.huaweicloud.plm.system.dto.SysIdempotentRecordSaveRequest;
import com.huaweicloud.plm.system.entity.SysIdempotentRecord;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysIdempotentRecordService;
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
 * 幂等记录接口（G1-N1 集成平台，WBS T009）：幂等键登记、结果回写与重复识别。
 */
@RestController
@RequestMapping("/platform/integration/idempotent-records")
@RequiredArgsConstructor
public class SysIdempotentRecordController {

    private final SysIdempotentRecordService service;

    @GetMapping
    @RequirePermission("platform:integration:idempotent:list")
    public ApiResponse<PageResult<SysIdempotentRecord>> page(IntegrationQuery query) {
        return ApiResponse.success(service.pageRecords(query));
    }

    @GetMapping("/stats")
    @RequirePermission("platform:integration:idempotent:list")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.success(service.stats());
    }

    @GetMapping("/check")
    @RequirePermission("platform:integration:idempotent:list")
    public ApiResponse<Map<String, Object>> check(@RequestParam(required = false) String idempotentKey) {
        return ApiResponse.success(service.check(idempotentKey));
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:integration:idempotent:list")
    public ApiResponse<SysIdempotentRecord> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:integration:idempotent:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SysIdempotentRecordSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:integration:idempotent:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SysIdempotentRecordSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    /** 标记处理成功。 */
    @PostMapping("/{id}/success")
    @RequirePermission("platform:integration:idempotent:manage")
    public ApiResponse<SysIdempotentRecord> success(@PathVariable Long id) {
        return ApiResponse.success(service.markSuccess(id));
    }

    /** 标记重复请求。 */
    @PostMapping("/{id}/duplicate")
    @RequirePermission("platform:integration:idempotent:manage")
    public ApiResponse<SysIdempotentRecord> duplicate(@PathVariable Long id) {
        return ApiResponse.success(service.markDuplicate(id));
    }

    /** 标记处理失败。 */
    @PostMapping("/{id}/fail")
    @RequirePermission("platform:integration:idempotent:manage")
    public ApiResponse<SysIdempotentRecord> fail(@PathVariable Long id) {
        return ApiResponse.success(service.markFail(id));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:integration:idempotent:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
