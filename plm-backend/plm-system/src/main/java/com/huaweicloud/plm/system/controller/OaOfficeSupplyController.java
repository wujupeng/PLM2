package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.BizOfficeSupplyRequestSaveRequest;
import com.huaweicloud.plm.system.dto.OaBizFlowQuery;
import com.huaweicloud.plm.system.entity.OaOfficeSupplyRequest;
import com.huaweicloud.plm.system.entity.OaOfficeSupplyRequestItem;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaOfficeSupplyService;
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
 * 办公用品申请接口（OA-DEV-081）：申请、审批、领用发放与明细查询。
 */
@RestController
@RequestMapping("/oa/special/office-supplies")
@RequiredArgsConstructor
public class OaOfficeSupplyController {

    private final OaOfficeSupplyService officeSupplyService;

    @GetMapping
    @RequirePermission("oa:supply:list")
    public ApiResponse<PageResult<OaOfficeSupplyRequest>> page(OaBizFlowQuery query) {
        return ApiResponse.success(officeSupplyService.page(query, query.getApplicantUserId()));
    }

    @GetMapping("/{id}")
    @RequirePermission("oa:supply:list")
    public ApiResponse<OaOfficeSupplyRequest> detail(@PathVariable Long id) {
        return ApiResponse.success(officeSupplyService.detail(id));
    }

    /** 申请明细行。 */
    @GetMapping("/{id}/items")
    @RequirePermission("oa:supply:list")
    public ApiResponse<List<OaOfficeSupplyRequestItem>> listItems(@PathVariable Long id) {
        return ApiResponse.success(officeSupplyService.listItems(id));
    }

    @PostMapping
    @RequirePermission("oa:supply:apply")
    public ApiResponse<Long> create(@Valid @RequestBody BizOfficeSupplyRequestSaveRequest request) {
        return ApiResponse.success(officeSupplyService.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("oa:supply:apply")
    public ApiResponse<Void> update(@PathVariable Long id, @Valid @RequestBody BizOfficeSupplyRequestSaveRequest request) {
        officeSupplyService.save(id, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{id}")
    @RequirePermission("oa:supply:apply")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        officeSupplyService.delete(id);
        return ApiResponse.success();
    }

    /** 撤回：仅审批中的申请单可撤回。 */
    @PutMapping("/{id}/cancel")
    @RequirePermission("oa:supply:apply")
    public ApiResponse<Void> cancel(@PathVariable Long id) {
        officeSupplyService.withdraw(id);
        return ApiResponse.success();
    }

    /** 发放领用：审批通过后按明细发放并扣减库存台账。 */
    @PutMapping("/{id}/issue")
    @RequirePermission("oa:supply:manage")
    public ApiResponse<Void> issue(@PathVariable Long id, @RequestParam(required = false) String issueRemark) {
        officeSupplyService.issue(id, issueRemark);
        return ApiResponse.success();
    }
}
