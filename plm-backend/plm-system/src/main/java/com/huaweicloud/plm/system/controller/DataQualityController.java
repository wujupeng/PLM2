package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.DataQualityQuery;
import com.huaweicloud.plm.system.dto.DataQualityScanResult;
import com.huaweicloud.plm.system.entity.MdDataQualityIssue;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.DataQualityService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * 物料数据质量接口（DEV-024）。
 */
@RestController
@RequestMapping("/product-data/quality-issues")
@RequiredArgsConstructor
public class DataQualityController {

    private final DataQualityService dataQualityService;

    @GetMapping
    @RequirePermission("material:quality:list")
    public ApiResponse<PageResult<MdDataQualityIssue>> page(DataQualityQuery query) {
        return ApiResponse.success(dataQualityService.page(query));
    }

    @PostMapping("/scan")
    @RequirePermission("material:quality:scan")
    public ApiResponse<DataQualityScanResult> scan() {
        return ApiResponse.success(dataQualityService.scan());
    }

    @PutMapping("/{issueId}/status")
    @RequirePermission("material:quality:list")
    public ApiResponse<Void> updateStatus(@PathVariable Long issueId, @RequestBody Map<String, String> body) {
        dataQualityService.updateStatus(issueId, body.get("status"));
        return ApiResponse.success();
    }
}
