package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.SpecHarnessDetailResponse;
import com.huaweicloud.plm.system.dto.SpecHarnessQuery;
import com.huaweicloud.plm.system.dto.SpecHarnessSaveRequest;
import com.huaweicloud.plm.system.entity.SpecHarness;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.HarnessService;
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
 * 附件线束端子接口（DEV-044）。
 */
@RestController
@RequestMapping("/harness/harnesses")
@RequiredArgsConstructor
public class HarnessController {

    private final HarnessService harnessService;

    @GetMapping
    @RequirePermission("harness:list")
    public ApiResponse<PageResult<SpecHarness>> page(SpecHarnessQuery query) {
        return ApiResponse.success(harnessService.page(query));
    }

    @GetMapping("/{harnessId}")
    @RequirePermission("harness:list")
    public ApiResponse<SpecHarnessDetailResponse> detail(@PathVariable Long harnessId) {
        return ApiResponse.success(harnessService.detail(harnessId));
    }

    @GetMapping("/by-material/{materialCode}")
    @RequirePermission("harness:list")
    public ApiResponse<List<SpecHarness>> listByMaterial(@PathVariable String materialCode) {
        return ApiResponse.success(harnessService.listByMaterial(materialCode));
    }

    @PostMapping
    @RequirePermission("harness:create")
    public ApiResponse<Long> create(@Valid @RequestBody SpecHarnessSaveRequest request) {
        return ApiResponse.success(harnessService.create(request));
    }

    @PutMapping("/{harnessId}")
    @RequirePermission("harness:update")
    public ApiResponse<Void> update(@PathVariable Long harnessId,
                                    @Valid @RequestBody SpecHarnessSaveRequest request) {
        harnessService.update(harnessId, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{harnessId}")
    @RequirePermission("harness:delete")
    public ApiResponse<Void> delete(@PathVariable Long harnessId) {
        harnessService.delete(harnessId);
        return ApiResponse.success();
    }

    @PostMapping("/{harnessId}/release")
    @RequirePermission("harness:update")
    public ApiResponse<Void> release(@PathVariable Long harnessId) {
        harnessService.release(harnessId);
        return ApiResponse.success();
    }
}
