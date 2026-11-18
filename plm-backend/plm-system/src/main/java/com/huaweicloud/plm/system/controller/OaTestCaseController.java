package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.OaTestCaseSaveRequest;
import com.huaweicloud.plm.system.dto.OaTestQuery;
import com.huaweicloud.plm.system.entity.OaTestCase;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaTestCaseService;
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
 * 功能与回归测试用例接口（OA-DEV-105）：用例维护、执行回写与通过率统计。
 */
@RestController
@RequestMapping("/oa/test/cases")
@RequiredArgsConstructor
public class OaTestCaseController {

    private final OaTestCaseService service;

    @GetMapping
    @RequirePermission("oa:test:case:list")
    public ApiResponse<PageResult<OaTestCase>> page(OaTestQuery query) {
        return ApiResponse.success(service.pageCases(query));
    }

    @GetMapping("/stats")
    @RequirePermission("oa:test:case:list")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.success(service.stats());
    }

    @GetMapping("/{id}")
    @RequirePermission("oa:test:case:list")
    public ApiResponse<OaTestCase> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detailCase(id));
    }

    @PostMapping
    @RequirePermission("oa:test:case:manage")
    public ApiResponse<Long> create(@Valid @RequestBody OaTestCaseSaveRequest request) {
        return ApiResponse.success(service.saveCase(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("oa:test:case:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody OaTestCaseSaveRequest request) {
        return ApiResponse.success(service.saveCase(id, request));
    }

    /** 回写用例执行结果并更新执行时间。 */
    @PostMapping("/{id}/execute")
    @RequirePermission("oa:test:case:manage")
    public ApiResponse<OaTestCase> execute(@PathVariable Long id,
                                          @RequestParam(required = false) String execStatus,
                                          @RequestParam(required = false) String testResult,
                                          @RequestParam(required = false) String tester) {
        return ApiResponse.success(service.executeCase(id, execStatus, testResult, tester));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("oa:test:case:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.deleteCase(id);
        return ApiResponse.success();
    }
}
