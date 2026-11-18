package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.BizProductionSequenceSaveRequest;
import com.huaweicloud.plm.system.dto.OaBizFlowQuery;
import com.huaweicloud.plm.system.entity.OaBizProductionSequence;
import com.huaweicloud.plm.system.entity.OaBizProductionSequenceItem;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaBizProductionSequenceService;
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
 * 生产顺序表接口（OA-DEV-065）：无流程单据，承载顺序表维护、明细查询、发布与关闭协同。
 */
@RestController
@RequestMapping("/oa/biz/production-sequences")
@RequiredArgsConstructor
public class OaBizProductionSequenceController {

    private final OaBizProductionSequenceService productionSequenceService;

    /** 生产顺序表分页。 */
    @GetMapping
    @RequirePermission("oa:biz:sales:list")
    public ApiResponse<PageResult<OaBizProductionSequence>> page(OaBizFlowQuery query) {
        return ApiResponse.success(productionSequenceService.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("oa:biz:sales:list")
    public ApiResponse<OaBizProductionSequence> detail(@PathVariable Long id) {
        return ApiResponse.success(productionSequenceService.detail(id));
    }

    /** 顺序表明细行。 */
    @GetMapping("/{id}/items")
    @RequirePermission("oa:biz:sales:manage")
    public ApiResponse<List<OaBizProductionSequenceItem>> listItems(@PathVariable Long id) {
        return ApiResponse.success(productionSequenceService.listItems(id));
    }

    @PostMapping
    @RequirePermission("oa:biz:sales:apply")
    public ApiResponse<Long> create(@Valid @RequestBody BizProductionSequenceSaveRequest request) {
        return ApiResponse.success(productionSequenceService.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("oa:biz:sales:apply")
    public ApiResponse<Void> update(@PathVariable Long id, @Valid @RequestBody BizProductionSequenceSaveRequest request) {
        productionSequenceService.save(id, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{id}")
    @RequirePermission("oa:biz:sales:apply")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        productionSequenceService.delete(id);
        return ApiResponse.success();
    }

    /** 发布：仅草稿可发布，发布后车间可查询。 */
    @PutMapping("/{id}/publish")
    @RequirePermission("oa:biz:sales:manage")
    public ApiResponse<Void> publish(@PathVariable Long id) {
        productionSequenceService.publish(id);
        return ApiResponse.success();
    }

    /** 关闭生产顺序表。 */
    @PutMapping("/{id}/close")
    @RequirePermission("oa:biz:sales:manage")
    public ApiResponse<Void> close(@PathVariable Long id) {
        productionSequenceService.close(id);
        return ApiResponse.success();
    }
}
