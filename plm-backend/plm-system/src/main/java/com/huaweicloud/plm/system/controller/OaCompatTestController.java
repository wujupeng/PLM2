package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.OaCompatTestSaveRequest;
import com.huaweicloud.plm.system.dto.OaTestQuery;
import com.huaweicloud.plm.system.entity.OaCompatTest;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaCompatTestService;
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
 * 兼容性测试接口（OA-DEV-109）：浏览器/终端环境测试记录与结论评定。
 */
@RestController
@RequestMapping("/oa/test/compat-tests")
@RequiredArgsConstructor
public class OaCompatTestController {

    private final OaCompatTestService compatTestService;

    @GetMapping
    @RequirePermission("oa:test:compat:list")
    public ApiResponse<PageResult<OaCompatTest>> page(OaTestQuery query) {
        return ApiResponse.success(compatTestService.pageCompatTests(query));
    }

    @GetMapping("/stats")
    @RequirePermission("oa:test:compat:list")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.success(compatTestService.stats());
    }

    @GetMapping("/{id}")
    @RequirePermission("oa:test:compat:list")
    public ApiResponse<OaCompatTest> detail(@PathVariable Long id) {
        return ApiResponse.success(compatTestService.detail(id));
    }

    @PostMapping
    @RequirePermission("oa:test:compat:manage")
    public ApiResponse<Long> create(@Valid @RequestBody OaCompatTestSaveRequest request) {
        return ApiResponse.success(compatTestService.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("oa:test:compat:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody OaCompatTestSaveRequest request) {
        return ApiResponse.success(compatTestService.save(id, request));
    }

    /** 评定兼容性测试结论。 */
    @PostMapping("/{id}/evaluate")
    @RequirePermission("oa:test:compat:manage")
    public ApiResponse<OaCompatTest> evaluate(@PathVariable Long id,
                                              @RequestParam(required = false) String result) {
        return ApiResponse.success(compatTestService.evaluate(id, result));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("oa:test:compat:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        compatTestService.delete(id);
        return ApiResponse.success();
    }
}
