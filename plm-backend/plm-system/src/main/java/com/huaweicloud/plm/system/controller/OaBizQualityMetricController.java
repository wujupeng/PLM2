package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.BizQualityMetricSaveRequest;
import com.huaweicloud.plm.system.dto.OaBizFlowQuery;
import com.huaweicloud.plm.system.entity.OaBizQualityMetric;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaBizQualityMetricService;
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

/**
 * 质量报表与指标接口（OA-DEV-069）：无流程单据，承载指标维护、发布与删除。
 */
@RestController
@RequestMapping("/oa/biz/quality-metrics")
@RequiredArgsConstructor
public class OaBizQualityMetricController {

    private final OaBizQualityMetricService qualityMetricService;

    /** 质量指标分页。 */
    @GetMapping
    @RequirePermission("oa:biz:quality:list")
    public ApiResponse<PageResult<OaBizQualityMetric>> page(OaBizFlowQuery query) {
        return ApiResponse.success(qualityMetricService.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("oa:biz:quality:list")
    public ApiResponse<OaBizQualityMetric> detail(@PathVariable Long id) {
        return ApiResponse.success(qualityMetricService.detail(id));
    }

    @PostMapping
    @RequirePermission("oa:biz:quality:apply")
    public ApiResponse<Long> create(@Valid @RequestBody BizQualityMetricSaveRequest request) {
        return ApiResponse.success(qualityMetricService.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("oa:biz:quality:apply")
    public ApiResponse<Void> update(@PathVariable Long id, @Valid @RequestBody BizQualityMetricSaveRequest request) {
        qualityMetricService.save(id, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{id}")
    @RequirePermission("oa:biz:quality:apply")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        qualityMetricService.delete(id);
        return ApiResponse.success();
    }

    /** 发布指标：草稿可发布。 */
    @PutMapping("/{id}/publish")
    @RequirePermission("oa:biz:quality:manage")
    public ApiResponse<Void> publish(@PathVariable Long id) {
        qualityMetricService.publish(id);
        return ApiResponse.success();
    }
}
