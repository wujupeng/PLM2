package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.BizEdiNoticeSaveRequest;
import com.huaweicloud.plm.system.dto.OaIntegrationQuery;
import com.huaweicloud.plm.system.entity.OaEdiNotice;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaEdiNoticeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * EDI 状态通知接口（OA-DEV-093）：报文状态/失败告警/交付异常接收与处理留痕。
 */
@RestController
@RequestMapping("/oa/integration/edi-notices")
@RequiredArgsConstructor
public class OaEdiNoticeController {

    private final OaEdiNoticeService ediNoticeService;

    @GetMapping
    @RequirePermission("oa:integration:edi:list")
    public ApiResponse<PageResult<OaEdiNotice>> page(OaIntegrationQuery query) {
        return ApiResponse.success(ediNoticeService.page(query));
    }

    @GetMapping("/stats")
    @RequirePermission("oa:integration:edi:list")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.success(ediNoticeService.stats());
    }

    @GetMapping("/{id}")
    @RequirePermission("oa:integration:edi:list")
    public ApiResponse<OaEdiNotice> detail(@PathVariable Long id) {
        return ApiResponse.success(ediNoticeService.detail(id));
    }

    @PostMapping
    @RequirePermission("oa:integration:edi:manage")
    public ApiResponse<Long> create(@Valid @RequestBody BizEdiNoticeSaveRequest request) {
        return ApiResponse.success(ediNoticeService.save(null, request));
    }

    /** 处理 EDI 通知。 */
    @PostMapping("/{id}/handle")
    @RequirePermission("oa:integration:edi:manage")
    public ApiResponse<OaEdiNotice> handle(@PathVariable Long id,
                                           @RequestParam(required = false) String handleRemark) {
        return ApiResponse.success(ediNoticeService.handle(id, handleRemark));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("oa:integration:edi:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        ediNoticeService.delete(id);
        return ApiResponse.success();
    }
}
