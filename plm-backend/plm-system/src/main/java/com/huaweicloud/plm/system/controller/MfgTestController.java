package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MfgTestQuery;
import com.huaweicloud.plm.system.dto.MfgTestSaveRequest;
import com.huaweicloud.plm.system.entity.MfgTestResult;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MfgTestService;
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

import java.util.List;

/**
 * 关键参数与测试结果接口（N8，DEV-087）：电气、尺寸、装配、焊接、点胶灌封等检验/工艺数据。
 */
@RestController
@RequestMapping("/mfg/tests")
@RequiredArgsConstructor
public class MfgTestController {

    private final MfgTestService mfgTestService;

    @GetMapping
    @RequirePermission("mfg:test:list")
    public ApiResponse<PageResult<MfgTestResult>> page(MfgTestQuery query) {
        return ApiResponse.success(mfgTestService.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("mfg:test:list")
    public ApiResponse<MfgTestResult> detail(@PathVariable Long id) {
        return ApiResponse.success(mfgTestService.require(id));
    }

    @GetMapping("/batch/{batchNo}")
    @RequirePermission("mfg:test:list")
    public ApiResponse<List<MfgTestResult>> listByBatch(@PathVariable String batchNo) {
        return ApiResponse.success(mfgTestService.listByBatch(batchNo));
    }

    @PostMapping
    @RequirePermission("mfg:test:save")
    public ApiResponse<Long> create(@Valid @RequestBody MfgTestSaveRequest request) {
        return ApiResponse.success(mfgTestService.create(request));
    }

    @PutMapping("/{id}")
    @RequirePermission("mfg:test:save")
    public ApiResponse<Void> update(@PathVariable Long id,
                                    @Valid @RequestBody MfgTestSaveRequest request) {
        mfgTestService.update(id, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{id}")
    @RequirePermission("mfg:test:save")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        mfgTestService.delete(id);
        return ApiResponse.success();
    }
}
