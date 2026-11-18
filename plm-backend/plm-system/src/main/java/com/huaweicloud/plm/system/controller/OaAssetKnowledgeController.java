package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.BizAssetKnowledgeSaveRequest;
import com.huaweicloud.plm.system.dto.OaBizFlowQuery;
import com.huaweicloud.plm.system.entity.OaAssetRepairKnowledge;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaAssetKnowledgeService;
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
 * 维修知识库接口（OA-DEV-079）：知识条目维护与按资产/故障检索。
 */
@RestController
@RequestMapping("/oa/asset/knowledge")
@RequiredArgsConstructor
public class OaAssetKnowledgeController {

    private final OaAssetKnowledgeService assetKnowledgeService;

    @GetMapping
    @RequirePermission("oa:asset:list")
    public ApiResponse<PageResult<OaAssetRepairKnowledge>> page(OaBizFlowQuery query) {
        return ApiResponse.success(assetKnowledgeService.page(query));
    }

    /** 按资产类别与关键词检索知识条目。 */
    @GetMapping("/search")
    @RequirePermission("oa:asset:list")
    public ApiResponse<List<OaAssetRepairKnowledge>> search(@RequestParam(required = false) String assetCategory,
                                                            @RequestParam(required = false) String keyword) {
        return ApiResponse.success(assetKnowledgeService.search(assetCategory, keyword));
    }

    @GetMapping("/{id}")
    @RequirePermission("oa:asset:list")
    public ApiResponse<OaAssetRepairKnowledge> detail(@PathVariable Long id) {
        return ApiResponse.success(assetKnowledgeService.detail(id));
    }

    @PostMapping
    @RequirePermission("oa:asset:manage")
    public ApiResponse<Long> create(@Valid @RequestBody BizAssetKnowledgeSaveRequest request) {
        return ApiResponse.success(assetKnowledgeService.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("oa:asset:manage")
    public ApiResponse<Void> update(@PathVariable Long id, @Valid @RequestBody BizAssetKnowledgeSaveRequest request) {
        assetKnowledgeService.save(id, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{id}")
    @RequirePermission("oa:asset:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        assetKnowledgeService.delete(id);
        return ApiResponse.success();
    }
}
