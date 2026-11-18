package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.OaGoliveQuery;
import com.huaweicloud.plm.system.dto.OaGoliveWatchSaveRequest;
import com.huaweicloud.plm.system.entity.OaGoliveWatch;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaGoliveWatchService;
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
 * 上线值守与问题响应接口（OA-DEV-117）：值守班次、值守人员、监控范围与问题闭环。
 */
@RestController
@RequestMapping("/oa/golive/watches")
@RequiredArgsConstructor
public class OaGoliveWatchController {

    private final OaGoliveWatchService service;

    @GetMapping
    @RequirePermission("oa:golive:watch:list")
    public ApiResponse<PageResult<OaGoliveWatch>> page(OaGoliveQuery query) {
        return ApiResponse.success(service.pageWatches(query));
    }

    @GetMapping("/stats")
    @RequirePermission("oa:golive:watch:list")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.success(service.stats());
    }

    @GetMapping("/{id}")
    @RequirePermission("oa:golive:watch:list")
    public ApiResponse<OaGoliveWatch> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("oa:golive:watch:manage")
    public ApiResponse<Long> create(@Valid @RequestBody OaGoliveWatchSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("oa:golive:watch:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody OaGoliveWatchSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    /** 结束值守并登记值守小结。 */
    @PostMapping("/{id}/close")
    @RequirePermission("oa:golive:watch:manage")
    public ApiResponse<OaGoliveWatch> close(@PathVariable Long id,
                                            @RequestParam(required = false) String reportSummary) {
        return ApiResponse.success(service.close(id, reportSummary));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("oa:golive:watch:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
