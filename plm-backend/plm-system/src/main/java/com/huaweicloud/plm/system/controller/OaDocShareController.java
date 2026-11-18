package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.system.dto.DocShareItem;
import com.huaweicloud.plm.system.dto.DocShareSaveRequest;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaDocShareService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
 * 文档分享接口（OA-DEV-050）：内部分享与链接分享，支持有效期与撤销、下载控制。
 */
@RestController
@RequestMapping("/oa/doc-shares")
@RequiredArgsConstructor
public class OaDocShareController {

    private final OaDocShareService shareService;

    @GetMapping
    @RequirePermission("oa:doc:list")
    public ApiResponse<List<DocShareItem>> list(@RequestParam Long docId) {
        return ApiResponse.success(shareService.list(docId));
    }

    @PostMapping
    @RequirePermission("oa:doc:share")
    public ApiResponse<Long> create(@RequestParam Long docId,
                                    @Valid @RequestBody DocShareSaveRequest request) {
        return ApiResponse.success(shareService.create(docId, request));
    }

    @PutMapping("/{shareId}/revoke")
    @RequirePermission("oa:doc:share")
    public ApiResponse<Void> revoke(@PathVariable Long shareId) {
        shareService.revoke(shareId);
        return ApiResponse.success();
    }
}
