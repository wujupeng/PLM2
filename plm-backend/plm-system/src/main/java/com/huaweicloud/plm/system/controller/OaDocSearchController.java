package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.DocSearchItem;
import com.huaweicloud.plm.system.dto.DocSearchQuery;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.DocSearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 统一检索接口（OA-DEV-052）：标题/元数据/正文关键词检索，结果按权限过滤并返回命中片段。
 */
@RestController
@RequestMapping("/oa/doc-search")
@RequiredArgsConstructor
public class OaDocSearchController {

    private final DocSearchService searchService;

    @GetMapping
    @RequirePermission("oa:doc:search")
    public ApiResponse<PageResult<DocSearchItem>> search(DocSearchQuery query) {
        return ApiResponse.success(searchService.search(query));
    }

    /** 重建索引：供上线初始化与数据迁移后补索引使用。 */
    @PostMapping("/reindex")
    @RequirePermission("oa:doc:search")
    public ApiResponse<Integer> reindex() {
        return ApiResponse.success(searchService.reindex());
    }
}
