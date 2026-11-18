package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.BizFiveMChangeSaveRequest;
import com.huaweicloud.plm.system.dto.OaBizFlowQuery;
import com.huaweicloud.plm.system.entity.OaBizFiveMChange;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaBizFiveMChangeService;
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
 * 5M 变更追踪接口（OA-DEV-072）：列表、详情、保存并提交、撤回与删除。
 */
@RestController
@RequestMapping("/oa/biz/five-m-changes")
@RequiredArgsConstructor
public class OaBizFiveMChangeController {

    private final OaBizFiveMChangeService fiveMChangeService;

    /** 5M 变更单分页。 */
    @GetMapping
    @RequirePermission("oa:biz:rd:list")
    public ApiResponse<PageResult<OaBizFiveMChange>> page(OaBizFlowQuery query) {
        return ApiResponse.success(fiveMChangeService.page(query, query.getApplicantUserId()));
    }

    @GetMapping("/{id}")
    @RequirePermission("oa:biz:rd:list")
    public ApiResponse<OaBizFiveMChange> detail(@PathVariable Long id) {
        return ApiResponse.success(fiveMChangeService.detail(id));
    }

    @PostMapping
    @RequirePermission("oa:biz:rd:apply")
    public ApiResponse<Long> create(@Valid @RequestBody BizFiveMChangeSaveRequest request) {
        return ApiResponse.success(fiveMChangeService.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("oa:biz:rd:apply")
    public ApiResponse<Void> update(@PathVariable Long id, @Valid @RequestBody BizFiveMChangeSaveRequest request) {
        fiveMChangeService.save(id, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{id}")
    @RequirePermission("oa:biz:rd:apply")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        fiveMChangeService.delete(id);
        return ApiResponse.success();
    }

    /** 撤回：仅流程审批中的单据可撤回。 */
    @PutMapping("/{id}/cancel")
    @RequirePermission("oa:biz:rd:apply")
    public ApiResponse<Void> cancel(@PathVariable Long id) {
        fiveMChangeService.withdraw(id);
        return ApiResponse.success();
    }
}
