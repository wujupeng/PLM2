package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ProcessOperationSaveRequest;
import com.huaweicloud.plm.system.dto.ProcessRouteDetailResponse;
import com.huaweicloud.plm.system.dto.ProcessRouteQuery;
import com.huaweicloud.plm.system.dto.ProcessRouteSaveRequest;
import com.huaweicloud.plm.system.entity.InspectionSpec;
import com.huaweicloud.plm.system.entity.ProcessRoute;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ProcessRouteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;
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
 * 工艺路线接口（DEV-047）。
 */
@RestController
@RequestMapping("/process/routes")
@RequiredArgsConstructor
public class ProcessRouteController {

    private final ProcessRouteService processRouteService;

    @GetMapping
    @RequirePermission("process:list")
    public ApiResponse<PageResult<ProcessRoute>> page(ProcessRouteQuery query) {
        return ApiResponse.success(processRouteService.page(query));
    }

    @GetMapping("/{routeId}")
    @RequirePermission("process:list")
    public ApiResponse<ProcessRouteDetailResponse> detail(@PathVariable Long routeId) {
        return ApiResponse.success(processRouteService.detail(routeId));
    }

    @GetMapping("/by-product/{productCode}")
    @RequirePermission("process:list")
    public ApiResponse<ProcessRoute> byProduct(@PathVariable String productCode) {
        return ApiResponse.success(processRouteService.findReleasedByProduct(productCode));
    }

    @PostMapping
    @RequirePermission("process:create")
    public ApiResponse<Long> create(@Valid @RequestBody ProcessRouteSaveRequest request) {
        return ApiResponse.success(processRouteService.create(request));
    }

    @PutMapping("/{routeId}")
    @RequirePermission("process:update")
    public ApiResponse<Void> update(@PathVariable Long routeId,
                                    @Valid @RequestBody ProcessRouteSaveRequest request) {
        processRouteService.update(routeId, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{routeId}")
    @RequirePermission("process:delete")
    public ApiResponse<Void> delete(@PathVariable Long routeId) {
        processRouteService.delete(routeId);
        return ApiResponse.success();
    }

    @PutMapping("/{routeId}/operations")
    @RequirePermission("process:operation:save")
    public ApiResponse<Void> saveOperations(@PathVariable Long routeId,
                                            @RequestBody List<ProcessOperationSaveRequest> operations) {
        processRouteService.saveOperations(routeId, operations);
        return ApiResponse.success();
    }

    @PostMapping("/{routeId}/release")
    @RequirePermission("process:update")
    public ApiResponse<Void> release(@PathVariable Long routeId) {
        processRouteService.release(routeId);
        return ApiResponse.success();
    }

    @GetMapping("/{routeId}/operations/{operationId}/inspection-spec")
    @RequirePermission("process:list")
    public ApiResponse<InspectionSpec> operationInspectionSpec(@PathVariable Long routeId,
                                                               @PathVariable Long operationId) {
        ProcessRouteService.OperationInspectionSpec result =
                processRouteService.findOperationInspectionSpec(routeId, operationId);
        ApiResponse<InspectionSpec> response = ApiResponse.success(result.spec());
        if (StringUtils.hasText(result.message())) {
            response.setMessage(result.message());
        }
        return response;
    }
}
