package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.BizAssetRepairAcceptRequest;
import com.huaweicloud.plm.system.dto.BizAssetRepairDispatchRequest;
import com.huaweicloud.plm.system.dto.BizAssetRepairHandleRequest;
import com.huaweicloud.plm.system.dto.BizAssetRepairSaveRequest;
import com.huaweicloud.plm.system.dto.OaBizFlowQuery;
import com.huaweicloud.plm.system.entity.OaAssetRepairOrder;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaAssetRepairService;
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
 * 设备维修工单接口（OA-DEV-078）：申请、派工、处理、验收、关闭全流程。
 */
@RestController
@RequestMapping("/oa/asset/repairs")
@RequiredArgsConstructor
public class OaAssetRepairController {

    private final OaAssetRepairService assetRepairService;

    /** 维修工单分页。 */
    @GetMapping
    @RequirePermission("oa:asset:list")
    public ApiResponse<PageResult<OaAssetRepairOrder>> page(OaBizFlowQuery query) {
        return ApiResponse.success(assetRepairService.page(query, query.getApplicantUserId()));
    }

    @GetMapping("/{id}")
    @RequirePermission("oa:asset:list")
    public ApiResponse<OaAssetRepairOrder> detail(@PathVariable Long id) {
        return ApiResponse.success(assetRepairService.detail(id));
    }

    @PostMapping
    @RequirePermission("oa:asset:apply")
    public ApiResponse<Long> create(@Valid @RequestBody BizAssetRepairSaveRequest request) {
        return ApiResponse.success(assetRepairService.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("oa:asset:apply")
    public ApiResponse<Void> update(@PathVariable Long id, @Valid @RequestBody BizAssetRepairSaveRequest request) {
        assetRepairService.save(id, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{id}")
    @RequirePermission("oa:asset:apply")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        assetRepairService.delete(id);
        return ApiResponse.success();
    }

    /** 撤回：仅流程审批中的维修单可撤回。 */
    @PutMapping("/{id}/cancel")
    @RequirePermission("oa:asset:apply")
    public ApiResponse<Void> cancel(@PathVariable Long id) {
        assetRepairService.withdraw(id);
        return ApiResponse.success();
    }

    /** 派工：审批通过后指派维修人。 */
    @PutMapping("/{id}/dispatch")
    @RequirePermission("oa:asset:manage")
    public ApiResponse<Void> dispatch(@PathVariable Long id, @Valid @RequestBody BizAssetRepairDispatchRequest request) {
        assetRepairService.dispatch(id, request);
        return ApiResponse.success();
    }

    /** 登记维修处理结果。 */
    @PutMapping("/{id}/handle")
    @RequirePermission("oa:asset:manage")
    public ApiResponse<Void> handle(@PathVariable Long id, @Valid @RequestBody BizAssetRepairHandleRequest request) {
        assetRepairService.handle(id, request);
        return ApiResponse.success();
    }

    /** 验收维修结果。 */
    @PutMapping("/{id}/accept")
    @RequirePermission("oa:asset:manage")
    public ApiResponse<Void> accept(@PathVariable Long id, @Valid @RequestBody BizAssetRepairAcceptRequest request) {
        assetRepairService.accept(id, request);
        return ApiResponse.success();
    }

    /** 关闭工单。 */
    @PutMapping("/{id}/close")
    @RequirePermission("oa:asset:manage")
    public ApiResponse<Void> close(@PathVariable Long id) {
        assetRepairService.close(id);
        return ApiResponse.success();
    }
}
