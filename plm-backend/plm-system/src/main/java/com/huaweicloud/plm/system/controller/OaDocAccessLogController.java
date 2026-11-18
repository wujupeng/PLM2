package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.DocAccessLogQuery;
import com.huaweicloud.plm.system.entity.OaDocAccessLog;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.DocAccessLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 文档访问审计接口（OA-UAT-05 证据）：查看、预览、下载、编辑、删除、分享与恢复记录查询。
 */
@RestController
@RequestMapping("/oa/doc-access-logs")
@RequiredArgsConstructor
public class OaDocAccessLogController {

    private final DocAccessLogService accessLogService;

    @GetMapping
    @RequirePermission("oa:doc:list")
    public ApiResponse<PageResult<OaDocAccessLog>> page(DocAccessLogQuery query) {
        return ApiResponse.success(accessLogService.page(query));
    }
}
