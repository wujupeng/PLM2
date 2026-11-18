package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.WmsMaterialDiffQuery;
import com.huaweicloud.plm.system.dto.WmsMaterialDiffSaveRequest;
import com.huaweicloud.plm.system.entity.WmsMaterialDiff;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.WmsMaterialDiffService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 退补料差异处理接口：差异登记、分页查询与删除。
 */
@RestController
@RequestMapping("/wms/return/diffs")
@RequiredArgsConstructor
public class WmsMaterialDiffController {

    private final WmsMaterialDiffService service;

    @GetMapping
    @RequirePermission("wms:return:diff:list")
    public ApiResponse<PageResult<WmsMaterialDiff>> page(WmsMaterialDiffQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("wms:return:diff:list")
    public ApiResponse<WmsMaterialDiff> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("wms:return:diff:manage")
    public ApiResponse<Long> create(@Valid @RequestBody WmsMaterialDiffSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("wms:return:diff:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody WmsMaterialDiffSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("wms:return:diff:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
