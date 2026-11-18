package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.BizDeliveryCoordinationSaveRequest;
import com.huaweicloud.plm.system.dto.OaBizFlowQuery;
import com.huaweicloud.plm.system.entity.OaBizDeliveryCoordination;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaBizDeliveryCoordinationService;
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

/**
 * 交期延误协调单接口（OA-DEV-064）：列表、详情、保存并提交、撤回、闭环与删除。
 */
@RestController
@RequestMapping("/oa/biz/delivery-coordinations")
@RequiredArgsConstructor
public class OaBizDeliveryCoordinationController {

    private final OaBizDeliveryCoordinationService deliveryCoordinationService;

    /** 交期延误协调单分页。 */
    @GetMapping
    @RequirePermission("oa:biz:sales:list")
    public ApiResponse<PageResult<OaBizDeliveryCoordination>> page(OaBizFlowQuery query) {
        return ApiResponse.success(deliveryCoordinationService.page(query, query.getApplicantUserId()));
    }

    @GetMapping("/{id}")
    @RequirePermission("oa:biz:sales:list")
    public ApiResponse<OaBizDeliveryCoordination> detail(@PathVariable Long id) {
        return ApiResponse.success(deliveryCoordinationService.detail(id));
    }

    @PostMapping
    @RequirePermission("oa:biz:sales:apply")
    public ApiResponse<Long> create(@Valid @RequestBody BizDeliveryCoordinationSaveRequest request) {
        return ApiResponse.success(deliveryCoordinationService.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("oa:biz:sales:apply")
    public ApiResponse<Void> update(@PathVariable Long id, @Valid @RequestBody BizDeliveryCoordinationSaveRequest request) {
        deliveryCoordinationService.save(id, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{id}")
    @RequirePermission("oa:biz:sales:apply")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        deliveryCoordinationService.delete(id);
        return ApiResponse.success();
    }

    /** 撤回：仅流程审批中的单据可撤回。 */
    @PutMapping("/{id}/cancel")
    @RequirePermission("oa:biz:sales:apply")
    public ApiResponse<Void> cancel(@PathVariable Long id) {
        deliveryCoordinationService.withdraw(id);
        return ApiResponse.success();
    }

    /** 闭环：填写纠正措施并闭环。 */
    @PutMapping("/{id}/close")
    @RequirePermission("oa:biz:sales:manage")
    public ApiResponse<Void> close(@PathVariable Long id, @RequestParam(required = false) String correctiveAction) {
        deliveryCoordinationService.close(id, correctiveAction);
        return ApiResponse.success();
    }
}
