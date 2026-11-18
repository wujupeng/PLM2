package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.EcrConvertRequest;
import com.huaweicloud.plm.system.dto.EcrDetailResponse;
import com.huaweicloud.plm.system.dto.EcrQuery;
import com.huaweicloud.plm.system.dto.EcrReviewRequest;
import com.huaweicloud.plm.system.dto.EcrSaveRequest;
import com.huaweicloud.plm.system.entity.EcoChangeRequest;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.EcrService;
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
 * 工程变更申请（ECR）接口（DEV-039）。
 */
@RestController
@RequestMapping("/eco/change-requests")
@RequiredArgsConstructor
public class EcrController {

    private final EcrService ecrService;

    @GetMapping
    @RequirePermission("eco:list")
    public ApiResponse<PageResult<EcoChangeRequest>> page(EcrQuery query) {
        return ApiResponse.success(ecrService.page(query));
    }

    @GetMapping("/{ecrId}")
    @RequirePermission("eco:list")
    public ApiResponse<EcrDetailResponse> detail(@PathVariable Long ecrId) {
        return ApiResponse.success(ecrService.detail(ecrId));
    }

    @PostMapping
    @RequirePermission("eco:create")
    public ApiResponse<Long> create(@Valid @RequestBody EcrSaveRequest request) {
        return ApiResponse.success(ecrService.create(request));
    }

    @PutMapping("/{ecrId}")
    @RequirePermission("eco:update")
    public ApiResponse<Void> update(@PathVariable Long ecrId, @RequestBody EcrSaveRequest request) {
        ecrService.update(ecrId, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{ecrId}")
    @RequirePermission("eco:delete")
    public ApiResponse<Void> delete(@PathVariable Long ecrId) {
        ecrService.delete(ecrId);
        return ApiResponse.success();
    }

    @PostMapping("/{ecrId}/submit")
    @RequirePermission("eco:update")
    public ApiResponse<Void> submit(@PathVariable Long ecrId) {
        ecrService.submit(ecrId);
        return ApiResponse.success();
    }

    @PostMapping("/{ecrId}/review")
    @RequirePermission("eco:review")
    public ApiResponse<Void> review(@PathVariable Long ecrId,
                                    @Valid @RequestBody EcrReviewRequest request) {
        ecrService.review(ecrId, request);
        return ApiResponse.success();
    }

    @PostMapping("/{ecrId}/convert")
    @RequirePermission("eco:convert")
    public ApiResponse<Long> convert(@PathVariable Long ecrId,
                                     @RequestBody EcrConvertRequest request) {
        return ApiResponse.success(ecrService.convert(ecrId, request));
    }
}
