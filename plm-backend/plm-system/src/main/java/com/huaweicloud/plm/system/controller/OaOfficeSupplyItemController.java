package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.BizOfficeSupplyItemSaveRequest;
import com.huaweicloud.plm.system.dto.OaBizFlowQuery;
import com.huaweicloud.plm.system.entity.OaOfficeSupplyItem;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaOfficeSupplyItemService;
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
 * 办公用品目录接口（OA-DEV-081）：用品档案与库存台账基础数据维护。
 */
@RestController
@RequestMapping("/oa/special/office-supply/items")
@RequiredArgsConstructor
public class OaOfficeSupplyItemController {

    private final OaOfficeSupplyItemService officeSupplyItemService;

    @GetMapping
    @RequirePermission("oa:supply:list")
    public ApiResponse<PageResult<OaOfficeSupplyItem>> page(OaBizFlowQuery query) {
        return ApiResponse.success(officeSupplyItemService.page(query));
    }

    /** 启用中的用品列表，供申请单选择。 */
    @GetMapping("/enabled")
    @RequirePermission("oa:supply:list")
    public ApiResponse<List<OaOfficeSupplyItem>> listEnabled() {
        return ApiResponse.success(officeSupplyItemService.listEnabled());
    }

    @GetMapping("/{id}")
    @RequirePermission("oa:supply:list")
    public ApiResponse<OaOfficeSupplyItem> detail(@PathVariable Long id) {
        return ApiResponse.success(officeSupplyItemService.detail(id));
    }

    @PostMapping
    @RequirePermission("oa:supply:manage")
    public ApiResponse<Long> create(@Valid @RequestBody BizOfficeSupplyItemSaveRequest request) {
        return ApiResponse.success(officeSupplyItemService.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("oa:supply:manage")
    public ApiResponse<Void> update(@PathVariable Long id, @Valid @RequestBody BizOfficeSupplyItemSaveRequest request) {
        officeSupplyItemService.save(id, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{id}")
    @RequirePermission("oa:supply:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        officeSupplyItemService.delete(id);
        return ApiResponse.success();
    }
}
