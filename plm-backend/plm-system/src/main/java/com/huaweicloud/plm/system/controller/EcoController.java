package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.EcoApproveRequest;
import com.huaweicloud.plm.system.dto.EcoChangeItemSaveRequest;
import com.huaweicloud.plm.system.dto.EcoDetailResponse;
import com.huaweicloud.plm.system.dto.EcoExecuteRequest;
import com.huaweicloud.plm.system.dto.EcoExecuteResult;
import com.huaweicloud.plm.system.dto.EcoImpactAnalyzeRequest;
import com.huaweicloud.plm.system.dto.EcoImpactHandleRequest;
import com.huaweicloud.plm.system.dto.EcoNoticeSaveRequest;
import com.huaweicloud.plm.system.dto.EcoQuery;
import com.huaweicloud.plm.system.dto.EcoSaveRequest;
import com.huaweicloud.plm.system.entity.EcoChangeItem;
import com.huaweicloud.plm.system.entity.EcoChangeOrder;
import com.huaweicloud.plm.system.entity.EcoImpactAnalysis;
import com.huaweicloud.plm.system.entity.EcoNotice;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.EcoService;
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
 * 工程变更单（ECO）/ 变更通知（ECN）/ 影响分析接口（DEV-040 / DEV-041）。
 */
@RestController
@RequestMapping("/eco/change-orders")
@RequiredArgsConstructor
public class EcoController {

    private final EcoService ecoService;

    @GetMapping
    @RequirePermission("eco:list")
    public ApiResponse<PageResult<EcoChangeOrder>> page(EcoQuery query) {
        return ApiResponse.success(ecoService.page(query));
    }

    @GetMapping("/{ecoId}")
    @RequirePermission("eco:list")
    public ApiResponse<EcoDetailResponse> detail(@PathVariable Long ecoId) {
        return ApiResponse.success(ecoService.detail(ecoId));
    }

    @GetMapping("/{ecoId}/items")
    @RequirePermission("eco:list")
    public ApiResponse<List<EcoChangeItem>> items(@PathVariable Long ecoId) {
        return ApiResponse.success(ecoService.listItems(ecoId));
    }

    @GetMapping("/{ecoId}/notices")
    @RequirePermission("eco:list")
    public ApiResponse<List<EcoNotice>> notices(@PathVariable Long ecoId) {
        return ApiResponse.success(ecoService.listNotices(ecoId));
    }

    @GetMapping("/{ecoId}/impacts")
    @RequirePermission("eco:list")
    public ApiResponse<List<EcoImpactAnalysis>> impacts(@PathVariable Long ecoId) {
        return ApiResponse.success(ecoService.listImpacts(ecoId));
    }

    @PutMapping("/{ecoId}")
    @RequirePermission("eco:update")
    public ApiResponse<Void> update(@PathVariable Long ecoId, @RequestBody EcoSaveRequest request) {
        ecoService.update(ecoId, request);
        return ApiResponse.success();
    }

    @PostMapping("/{ecoId}/items")
    @RequirePermission("eco:update")
    public ApiResponse<Long> addItem(@PathVariable Long ecoId,
                                     @Valid @RequestBody EcoChangeItemSaveRequest request) {
        return ApiResponse.success(ecoService.addItem(ecoId, request));
    }

    @PutMapping("/items/{itemId}")
    @RequirePermission("eco:update")
    public ApiResponse<Void> updateItem(@PathVariable Long itemId,
                                        @RequestBody EcoChangeItemSaveRequest request) {
        ecoService.updateItem(itemId, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/items/{itemId}")
    @RequirePermission("eco:update")
    public ApiResponse<Void> deleteItem(@PathVariable Long itemId) {
        ecoService.deleteItem(itemId);
        return ApiResponse.success();
    }

    @PostMapping("/{ecoId}/submit")
    @RequirePermission("eco:update")
    public ApiResponse<Void> submit(@PathVariable Long ecoId) {
        ecoService.submit(ecoId);
        return ApiResponse.success();
    }

    @PostMapping("/{ecoId}/approve")
    @RequirePermission("eco:approve")
    public ApiResponse<Void> approve(@PathVariable Long ecoId,
                                     @Valid @RequestBody EcoApproveRequest request) {
        ecoService.approve(ecoId, request);
        return ApiResponse.success();
    }

    @PostMapping("/{ecoId}/impacts/analyze")
    @RequirePermission("eco:impact")
    public ApiResponse<List<EcoImpactAnalysis>> analyzeImpacts(
            @PathVariable Long ecoId,
            @RequestBody(required = false) EcoImpactAnalyzeRequest request) {
        return ApiResponse.success(ecoService.analyzeImpacts(ecoId, request));
    }

    @PutMapping("/impacts/{impactId}")
    @RequirePermission("eco:impact")
    public ApiResponse<Void> handleImpact(@PathVariable Long impactId,
                                          @Valid @RequestBody EcoImpactHandleRequest request) {
        ecoService.handleImpact(impactId, request);
        return ApiResponse.success();
    }

    @PostMapping("/{ecoId}/execute")
    @RequirePermission("eco:execute")
    public ApiResponse<EcoExecuteResult> execute(@PathVariable Long ecoId,
                                                 @RequestBody EcoExecuteRequest request) {
        return ApiResponse.success(ecoService.execute(ecoId, request));
    }

    @PostMapping("/{ecoId}/notices")
    @RequirePermission("eco:notice")
    public ApiResponse<Long> createNotice(@PathVariable Long ecoId,
                                          @Valid @RequestBody EcoNoticeSaveRequest request) {
        return ApiResponse.success(ecoService.createNotice(ecoId, request));
    }

    @PostMapping("/notices/{noticeId}/send")
    @RequirePermission("eco:notice")
    public ApiResponse<Void> sendNotice(@PathVariable Long noticeId) {
        ecoService.sendNotice(noticeId);
        return ApiResponse.success();
    }

    @PostMapping("/notices/{noticeId}/confirm")
    @RequirePermission("eco:notice")
    public ApiResponse<Void> confirmNotice(@PathVariable Long noticeId) {
        ecoService.confirmNotice(noticeId);
        return ApiResponse.success();
    }
}
