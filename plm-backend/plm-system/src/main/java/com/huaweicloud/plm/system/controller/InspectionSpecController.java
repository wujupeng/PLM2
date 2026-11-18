package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.InspectionItemSaveRequest;
import com.huaweicloud.plm.system.dto.InspectionSpecDetailResponse;
import com.huaweicloud.plm.system.dto.InspectionSpecQuery;
import com.huaweicloud.plm.system.dto.InspectionSpecSaveRequest;
import com.huaweicloud.plm.system.entity.InspectionSpec;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.InspectionSpecService;
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
 * 检验规范接口（DEV-048）。
 */
@RestController
@RequestMapping("/inspection/specs")
@RequiredArgsConstructor
public class InspectionSpecController {

    private final InspectionSpecService inspectionSpecService;

    @GetMapping
    @RequirePermission("inspection:list")
    public ApiResponse<PageResult<InspectionSpec>> page(InspectionSpecQuery query) {
        return ApiResponse.success(inspectionSpecService.page(query));
    }

    @GetMapping("/by-material/{materialCode}")
    @RequirePermission("inspection:list")
    public ApiResponse<List<InspectionSpec>> byMaterial(@PathVariable String materialCode) {
        return ApiResponse.success(inspectionSpecService.listReleasedByMaterial(materialCode));
    }

    @GetMapping("/by-product/{productCode}")
    @RequirePermission("inspection:list")
    public ApiResponse<List<InspectionSpec>> byProduct(@PathVariable String productCode) {
        return ApiResponse.success(inspectionSpecService.listReleasedByProduct(productCode));
    }

    @GetMapping("/match")
    @RequirePermission("inspection:list")
    public ApiResponse<InspectionSpec> match(@RequestParam(required = false) String productCode,
                                             @RequestParam(required = false) String materialCode,
                                             @RequestParam(required = false) String inspectionType) {
        return ApiResponse.success(inspectionSpecService.match(productCode, materialCode, inspectionType));
    }

    @GetMapping("/{specId}")
    @RequirePermission("inspection:list")
    public ApiResponse<InspectionSpecDetailResponse> detail(@PathVariable Long specId) {
        return ApiResponse.success(inspectionSpecService.detail(specId));
    }

    @PostMapping
    @RequirePermission("inspection:create")
    public ApiResponse<Long> create(@Valid @RequestBody InspectionSpecSaveRequest request) {
        return ApiResponse.success(inspectionSpecService.create(request));
    }

    @PutMapping("/{specId}")
    @RequirePermission("inspection:update")
    public ApiResponse<Void> update(@PathVariable Long specId,
                                    @Valid @RequestBody InspectionSpecSaveRequest request) {
        inspectionSpecService.update(specId, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{specId}")
    @RequirePermission("inspection:delete")
    public ApiResponse<Void> delete(@PathVariable Long specId) {
        inspectionSpecService.delete(specId);
        return ApiResponse.success();
    }

    @PutMapping("/{specId}/items")
    @RequirePermission("inspection:item:save")
    public ApiResponse<Void> saveItems(@PathVariable Long specId,
                                       @RequestBody List<InspectionItemSaveRequest> items) {
        inspectionSpecService.saveItems(specId, items);
        return ApiResponse.success();
    }

    @PostMapping("/{specId}/release")
    @RequirePermission("inspection:update")
    public ApiResponse<Void> release(@PathVariable Long specId) {
        inspectionSpecService.release(specId);
        return ApiResponse.success();
    }
}
