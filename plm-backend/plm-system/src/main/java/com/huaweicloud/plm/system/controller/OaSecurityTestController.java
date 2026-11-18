package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.OaSecurityTestSaveRequest;
import com.huaweicloud.plm.system.dto.OaTestQuery;
import com.huaweicloud.plm.system.entity.OaSecurityTest;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaSecurityTestService;
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
 * 安全测试接口（OA-DEV-107）：检查项维护、整改验证与风险统计。
 */
@RestController
@RequestMapping("/oa/test/security-tests")
@RequiredArgsConstructor
public class OaSecurityTestController {

    private final OaSecurityTestService service;

    @GetMapping
    @RequirePermission("oa:test:security:list")
    public ApiResponse<PageResult<OaSecurityTest>> page(OaTestQuery query) {
        return ApiResponse.success(service.pageSecurityTests(query));
    }

    @GetMapping("/stats")
    @RequirePermission("oa:test:security:list")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.success(service.stats());
    }

    @GetMapping("/{id}")
    @RequirePermission("oa:test:security:list")
    public ApiResponse<OaSecurityTest> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detailSecurityTest(id));
    }

    @PostMapping
    @RequirePermission("oa:test:security:manage")
    public ApiResponse<Long> create(@Valid @RequestBody OaSecurityTestSaveRequest request) {
        return ApiResponse.success(service.saveSecurityTest(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("oa:test:security:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody OaSecurityTestSaveRequest request) {
        return ApiResponse.success(service.saveSecurityTest(id, request));
    }

    /** 回写整改状态与验证结果并更新测试时间。 */
    @PostMapping("/{id}/fix")
    @RequirePermission("oa:test:security:manage")
    public ApiResponse<OaSecurityTest> fix(@PathVariable Long id,
                                          @RequestParam(required = false) String fixStatus,
                                          @RequestParam(required = false) String verifyResult) {
        return ApiResponse.success(service.fix(id, fixStatus, verifyResult));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("oa:test:security:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.deleteSecurityTest(id);
        return ApiResponse.success();
    }
}
