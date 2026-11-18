package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.BizChangeNoticeSaveRequest;
import com.huaweicloud.plm.system.dto.BizNoticeReceiptRequest;
import com.huaweicloud.plm.system.dto.OaBizFlowQuery;
import com.huaweicloud.plm.system.entity.OaBizChangeNotice;
import com.huaweicloud.plm.system.entity.OaBizChangeNoticeReceipt;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaBizChangeNoticeService;
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
 * 变更通知与图纸补发接口（OA-DEV-076）：列表、详情、我的待签收、签收记录、保存并提交、签收、撤回与删除。
 */
@RestController
@RequestMapping("/oa/biz/change-notices")
@RequiredArgsConstructor
public class OaBizChangeNoticeController {

    private final OaBizChangeNoticeService changeNoticeService;

    /** 变更通知分页。 */
    @GetMapping
    @RequirePermission("oa:biz:rd:list")
    public ApiResponse<PageResult<OaBizChangeNotice>> page(OaBizFlowQuery query) {
        return ApiResponse.success(changeNoticeService.page(query, query.getApplicantUserId()));
    }

    @GetMapping("/{id}")
    @RequirePermission("oa:biz:rd:list")
    public ApiResponse<OaBizChangeNotice> detail(@PathVariable Long id) {
        return ApiResponse.success(changeNoticeService.detail(id));
    }

    /** 我的待签收变更通知。 */
    @GetMapping("/my-receipts")
    @RequirePermission("oa:biz:notice:receipt")
    public ApiResponse<PageResult<OaBizChangeNotice>> pageMyReceipt(OaBizFlowQuery query) {
        return ApiResponse.success(changeNoticeService.pageMyReceipt(query));
    }

    /** 变更通知签收记录。 */
    @GetMapping("/{id}/receipts")
    @RequirePermission("oa:biz:notice:receipt")
    public ApiResponse<List<OaBizChangeNoticeReceipt>> listReceipts(@PathVariable Long id) {
        return ApiResponse.success(changeNoticeService.listReceipts(id));
    }

    @PostMapping
    @RequirePermission("oa:biz:rd:apply")
    public ApiResponse<Long> create(@Valid @RequestBody BizChangeNoticeSaveRequest request) {
        return ApiResponse.success(changeNoticeService.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("oa:biz:rd:apply")
    public ApiResponse<Void> update(@PathVariable Long id, @Valid @RequestBody BizChangeNoticeSaveRequest request) {
        changeNoticeService.save(id, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{id}")
    @RequirePermission("oa:biz:rd:apply")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        changeNoticeService.delete(id);
        return ApiResponse.success();
    }

    /** 撤回：仅流程审批中的单据可撤回。 */
    @PutMapping("/{id}/cancel")
    @RequirePermission("oa:biz:rd:apply")
    public ApiResponse<Void> cancel(@PathVariable Long id) {
        changeNoticeService.withdraw(id);
        return ApiResponse.success();
    }

    /** 签收：当前用户签收变更通知，记录签收时间与备注。 */
    @PutMapping("/{id}/sign")
    @RequirePermission("oa:biz:notice:receipt")
    public ApiResponse<Void> sign(@PathVariable Long id, @Valid @RequestBody BizNoticeReceiptRequest request) {
        changeNoticeService.sign(id, request.getReceiptRemark());
        return ApiResponse.success();
    }
}
