package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.BomCompareResponse;
import com.huaweicloud.plm.system.dto.BomDetailResponse;
import com.huaweicloud.plm.system.dto.BomExpandNode;
import com.huaweicloud.plm.system.dto.BomLineSaveRequest;
import com.huaweicloud.plm.system.dto.BomQuery;
import com.huaweicloud.plm.system.dto.BomSaveRequest;
import com.huaweicloud.plm.system.dto.BomValidationResult;
import com.huaweicloud.plm.system.dto.BomWhereUsedItem;
import com.huaweicloud.plm.system.dto.BomPublishRequest;
import com.huaweicloud.plm.system.dto.ConvertMbomRequest;
import com.huaweicloud.plm.system.entity.BomHeader;
import com.huaweicloud.plm.system.entity.BomIssue;
import com.huaweicloud.plm.system.entity.BomPublishLog;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.BomPublishService;
import com.huaweicloud.plm.system.service.BomService;
import com.huaweicloud.plm.system.service.BomValidationService;
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

import java.util.List;

/**
 * BOM 主数据接口（DEV-026 / DEV-027 / DEV-028 / DEV-029 / DEV-030 / DEV-031 / DEV-032）。
 */
@RestController
@RequestMapping("/bom/boms")
@RequiredArgsConstructor
public class BomController {

    private final BomService bomService;
    private final BomValidationService bomValidationService;
    private final BomPublishService bomPublishService;

    @GetMapping
    @RequirePermission("bom:list")
    public ApiResponse<PageResult<BomHeader>> page(BomQuery query) {
        return ApiResponse.success(bomService.page(query));
    }

    @GetMapping("/where-used")
    @RequirePermission("bom:list")
    public ApiResponse<List<BomWhereUsedItem>> whereUsedByMaterial(@RequestParam String materialCode) {
        return ApiResponse.success(bomService.whereUsed(materialCode));
    }

    @GetMapping("/compare")
    @RequirePermission("bom:compare")
    public ApiResponse<BomCompareResponse> compare(@RequestParam Long headerIdA, @RequestParam Long headerIdB) {
        return ApiResponse.success(bomService.compare(headerIdA, headerIdB));
    }

    @GetMapping("/{headerId}")
    @RequirePermission("bom:list")
    public ApiResponse<BomDetailResponse> detail(@PathVariable Long headerId) {
        return ApiResponse.success(bomService.detail(headerId));
    }

    @GetMapping("/{headerId}/expand")
    @RequirePermission("bom:list")
    public ApiResponse<List<BomExpandNode>> expand(@PathVariable Long headerId,
                                                   @RequestParam(defaultValue = "10") Integer levels) {
        return ApiResponse.success(bomService.expand(headerId, levels));
    }

    @GetMapping("/{headerId}/where-used")
    @RequirePermission("bom:list")
    public ApiResponse<List<BomWhereUsedItem>> whereUsed(@PathVariable Long headerId) {
        return ApiResponse.success(bomService.whereUsed(bomService.detail(headerId).getHeader().getProductCode()));
    }

    @GetMapping("/{headerId}/issues")
    @RequirePermission("bom:list")
    public ApiResponse<List<BomIssue>> issues(@PathVariable Long headerId) {
        return ApiResponse.success(bomValidationService.listIssues(headerId));
    }

    @GetMapping("/{headerId}/publish-logs")
    @RequirePermission("bom:list")
    public ApiResponse<List<BomPublishLog>> publishLogs(@PathVariable Long headerId) {
        return ApiResponse.success(bomPublishService.listLogs(headerId));
    }

    @PostMapping
    @RequirePermission("bom:create")
    public ApiResponse<Long> create(@Valid @RequestBody BomSaveRequest request) {
        return ApiResponse.success(bomService.create(request));
    }

    @PutMapping("/{headerId}")
    @RequirePermission("bom:update")
    public ApiResponse<Void> update(@PathVariable Long headerId, @Valid @RequestBody BomSaveRequest request) {
        bomService.update(headerId, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{headerId}")
    @RequirePermission("bom:delete")
    public ApiResponse<Void> delete(@PathVariable Long headerId) {
        bomService.delete(headerId);
        return ApiResponse.success();
    }

    @PostMapping("/{headerId}/lines")
    @RequirePermission("bom:update")
    public ApiResponse<Long> addLine(@PathVariable Long headerId, @Valid @RequestBody BomLineSaveRequest request) {
        return ApiResponse.success(bomService.addLine(headerId, request));
    }

    @PutMapping("/lines/{lineId}")
    @RequirePermission("bom:update")
    public ApiResponse<Void> updateLine(@PathVariable Long lineId, @Valid @RequestBody BomLineSaveRequest request) {
        bomService.updateLine(lineId, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/lines/{lineId}")
    @RequirePermission("bom:update")
    public ApiResponse<Void> deleteLine(@PathVariable Long lineId) {
        bomService.deleteLine(lineId);
        return ApiResponse.success();
    }

    @PostMapping("/{headerId}/validate")
    @RequirePermission("bom:validate")
    public ApiResponse<BomValidationResult> validate(@PathVariable Long headerId) {
        return ApiResponse.success(bomValidationService.validate(headerId));
    }

    @PostMapping("/{headerId}/convert-to-mbom")
    @RequirePermission("bom:convert")
    public ApiResponse<Long> convertToMbom(@PathVariable Long headerId,
                                           @RequestBody(required = false) ConvertMbomRequest request) {
        return ApiResponse.success(bomService.convertToMbom(headerId, request));
    }

    @PostMapping("/{headerId}/publish")
    @RequirePermission("bom:publish")
    public ApiResponse<List<BomPublishLog>> publish(@PathVariable Long headerId,
                                                    @RequestBody(required = false) BomPublishRequest request) {
        return ApiResponse.success(bomPublishService.publish(headerId, request));
    }

    @PostMapping("/publish-logs/{logId}/retry")
    @RequirePermission("bom:publish")
    public ApiResponse<BomPublishLog> retry(@PathVariable Long logId) {
        return ApiResponse.success(bomPublishService.retry(logId));
    }
}
