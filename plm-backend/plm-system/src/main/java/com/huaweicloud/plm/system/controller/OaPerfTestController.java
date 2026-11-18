package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.OaPerfTestSaveRequest;
import com.huaweicloud.plm.system.dto.OaTestQuery;
import com.huaweicloud.plm.system.entity.OaPerfTest;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaPerfTestService;
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
 * 性能与容量测试接口（OA-DEV-108）：压测场景指标维护与结论推导。
 */
@RestController
@RequestMapping("/oa/test/perf-tests")
@RequiredArgsConstructor
public class OaPerfTestController {

    private final OaPerfTestService perfTestService;

    @GetMapping
    @RequirePermission("oa:test:perf:list")
    public ApiResponse<PageResult<OaPerfTest>> page(OaTestQuery query) {
        return ApiResponse.success(perfTestService.pagePerfTests(query));
    }

    @GetMapping("/stats")
    @RequirePermission("oa:test:perf:list")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.success(perfTestService.stats());
    }

    @GetMapping("/{id}")
    @RequirePermission("oa:test:perf:list")
    public ApiResponse<OaPerfTest> detail(@PathVariable Long id) {
        return ApiResponse.success(perfTestService.detail(id));
    }

    @PostMapping
    @RequirePermission("oa:test:perf:manage")
    public ApiResponse<Long> create(@Valid @RequestBody OaPerfTestSaveRequest request) {
        return ApiResponse.success(perfTestService.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("oa:test:perf:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody OaPerfTestSaveRequest request) {
        return ApiResponse.success(perfTestService.save(id, request));
    }

    /** 依据目标与实际指标推导测试结论。 */
    @PostMapping("/{id}/conclude")
    @RequirePermission("oa:test:perf:manage")
    public ApiResponse<OaPerfTest> conclude(@PathVariable Long id) {
        return ApiResponse.success(perfTestService.conclude(id));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("oa:test:perf:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        perfTestService.delete(id);
        return ApiResponse.success();
    }
}
