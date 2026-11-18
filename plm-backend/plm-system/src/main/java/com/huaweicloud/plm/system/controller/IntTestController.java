package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.IntPerfTestQuery;
import com.huaweicloud.plm.system.dto.IntPerfTestSaveRequest;
import com.huaweicloud.plm.system.dto.IntTestCaseQuery;
import com.huaweicloud.plm.system.dto.IntTestCaseRunRequest;
import com.huaweicloud.plm.system.dto.IntTestCaseSaveRequest;
import com.huaweicloud.plm.system.entity.IntPerfTest;
import com.huaweicloud.plm.system.entity.IntTestCase;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.IntPerfTestService;
import com.huaweicloud.plm.system.service.IntTestCaseService;
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

/** 测试与性能接口（N9，DEV-100/DEV-101）。 */
@RestController
@RequestMapping("/int")
@RequiredArgsConstructor
public class IntTestController {

    private final IntTestCaseService intTestCaseService;
    private final IntPerfTestService intPerfTestService;

    @GetMapping("/test-cases")
    @RequirePermission("int:test:list")
    public ApiResponse<PageResult<IntTestCase>> pageTestCases(IntTestCaseQuery query) {
        return ApiResponse.success(intTestCaseService.page(query));
    }

    @GetMapping("/test-cases/{caseNo}")
    @RequirePermission("int:test:list")
    public ApiResponse<IntTestCase> testCaseDetail(@PathVariable String caseNo) {
        return ApiResponse.success(intTestCaseService.require(caseNo));
    }

    @PostMapping("/test-cases")
    @RequirePermission("int:test:save")
    public ApiResponse<String> createTestCase(@Valid @RequestBody IntTestCaseSaveRequest request) {
        return ApiResponse.success(intTestCaseService.create(request));
    }

    @PutMapping("/test-cases/{caseNo}")
    @RequirePermission("int:test:save")
    public ApiResponse<Void> updateTestCase(@PathVariable String caseNo,
                                            @Valid @RequestBody IntTestCaseSaveRequest request) {
        intTestCaseService.update(caseNo, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/test-cases/{caseNo}")
    @RequirePermission("int:test:save")
    public ApiResponse<Void> deleteTestCase(@PathVariable String caseNo) {
        intTestCaseService.delete(caseNo);
        return ApiResponse.success();
    }

    @PostMapping("/test-cases/{caseNo}/run")
    @RequirePermission("int:test:run")
    public ApiResponse<IntTestCase> runTestCase(@PathVariable String caseNo,
                                                @Valid @RequestBody IntTestCaseRunRequest request) {
        return ApiResponse.success(intTestCaseService.run(caseNo, request));
    }

    @GetMapping("/perf-tests")
    @RequirePermission("int:perf:list")
    public ApiResponse<PageResult<IntPerfTest>> pagePerfTests(IntPerfTestQuery query) {
        return ApiResponse.success(intPerfTestService.page(query));
    }

    @GetMapping("/perf-tests/{testNo}")
    @RequirePermission("int:perf:list")
    public ApiResponse<IntPerfTest> perfTestDetail(@PathVariable String testNo) {
        return ApiResponse.success(intPerfTestService.require(testNo));
    }

    @PostMapping("/perf-tests")
    @RequirePermission("int:perf:save")
    public ApiResponse<String> createPerfTest(@Valid @RequestBody IntPerfTestSaveRequest request) {
        return ApiResponse.success(intPerfTestService.create(request));
    }

    @PutMapping("/perf-tests/{testNo}")
    @RequirePermission("int:perf:save")
    public ApiResponse<Void> updatePerfTest(@PathVariable String testNo,
                                            @Valid @RequestBody IntPerfTestSaveRequest request) {
        intPerfTestService.update(testNo, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/perf-tests/{testNo}")
    @RequirePermission("int:perf:save")
    public ApiResponse<Void> deletePerfTest(@PathVariable String testNo) {
        intPerfTestService.delete(testNo);
        return ApiResponse.success();
    }

    @PostMapping("/perf-tests/{testNo}/evaluate")
    @RequirePermission("int:perf:save")
    public ApiResponse<IntPerfTest> evaluatePerfTest(@PathVariable String testNo) {
        return ApiResponse.success(intPerfTestService.evaluate(testNo));
    }
}
