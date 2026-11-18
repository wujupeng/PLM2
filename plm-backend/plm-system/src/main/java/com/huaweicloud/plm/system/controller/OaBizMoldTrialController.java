package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.BizMoldTrialSaveRequest;
import com.huaweicloud.plm.system.dto.OaBizFlowQuery;
import com.huaweicloud.plm.system.entity.OaBizMoldTrial;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaBizMoldTrialService;
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
 * 新开模检查与零件试流接口（OA-DEV-077）：列表、详情、保存并提交、撤回与删除。
 */
@RestController
@RequestMapping("/oa/biz/mold-trials")
@RequiredArgsConstructor
public class OaBizMoldTrialController {

    private final OaBizMoldTrialService moldTrialService;

    /** 新开模检查单分页。 */
    @GetMapping
    @RequirePermission("oa:biz:rd:list")
    public ApiResponse<PageResult<OaBizMoldTrial>> page(OaBizFlowQuery query) {
        return ApiResponse.success(moldTrialService.page(query, query.getApplicantUserId()));
    }

    @GetMapping("/{id}")
    @RequirePermission("oa:biz:rd:list")
    public ApiResponse<OaBizMoldTrial> detail(@PathVariable Long id) {
        return ApiResponse.success(moldTrialService.detail(id));
    }

    @PostMapping
    @RequirePermission("oa:biz:rd:apply")
    public ApiResponse<Long> create(@Valid @RequestBody BizMoldTrialSaveRequest request) {
        return ApiResponse.success(moldTrialService.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("oa:biz:rd:apply")
    public ApiResponse<Void> update(@PathVariable Long id, @Valid @RequestBody BizMoldTrialSaveRequest request) {
        moldTrialService.save(id, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{id}")
    @RequirePermission("oa:biz:rd:apply")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        moldTrialService.delete(id);
        return ApiResponse.success();
    }

    /** 撤回：仅流程审批中的单据可撤回。 */
    @PutMapping("/{id}/cancel")
    @RequirePermission("oa:biz:rd:apply")
    public ApiResponse<Void> cancel(@PathVariable Long id) {
        moldTrialService.withdraw(id);
        return ApiResponse.success();
    }
}
