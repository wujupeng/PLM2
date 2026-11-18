package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.OaPermissionTestSaveRequest;
import com.huaweicloud.plm.system.dto.OaTestQuery;
import com.huaweicloud.plm.system.entity.OaPermissionTest;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaPermissionTestService;
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
 * 角色与数据隔离测试接口（OA-DEV-106）：跨部门/跨工厂场景验证与隔离结论统计。
 */
@RestController
@RequestMapping("/oa/test/permission-tests")
@RequiredArgsConstructor
public class OaPermissionTestController {

    private final OaPermissionTestService service;

    @GetMapping
    @RequirePermission("oa:test:permission:list")
    public ApiResponse<PageResult<OaPermissionTest>> page(OaTestQuery query) {
        return ApiResponse.success(service.pagePermissionTests(query));
    }

    @GetMapping("/stats")
    @RequirePermission("oa:test:permission:list")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.success(service.stats());
    }

    @GetMapping("/{id}")
    @RequirePermission("oa:test:permission:list")
    public ApiResponse<OaPermissionTest> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detailPermissionTest(id));
    }

    @PostMapping
    @RequirePermission("oa:test:permission:manage")
    public ApiResponse<Long> create(@Valid @RequestBody OaPermissionTestSaveRequest request) {
        return ApiResponse.success(service.savePermissionTest(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("oa:test:permission:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody OaPermissionTestSaveRequest request) {
        return ApiResponse.success(service.savePermissionTest(id, request));
    }

    /** 回写隔离测试结论并更新测试时间。 */
    @PostMapping("/{id}/evaluate")
    @RequirePermission("oa:test:permission:manage")
    public ApiResponse<OaPermissionTest> evaluate(@PathVariable Long id,
                                                 @RequestParam(required = false) String result,
                                                 @RequestParam(required = false) Boolean isolationPass) {
        return ApiResponse.success(service.evaluate(id, result, isolationPass));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("oa:test:permission:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.deletePermissionTest(id);
        return ApiResponse.success();
    }
}
