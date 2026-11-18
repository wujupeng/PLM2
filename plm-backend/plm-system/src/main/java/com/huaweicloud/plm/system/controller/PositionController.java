package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.PositionQuery;
import com.huaweicloud.plm.system.dto.PositionSaveRequest;
import com.huaweicloud.plm.system.entity.SysPosition;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.PositionService;
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

@RestController
@RequestMapping("/oa/positions")
@RequiredArgsConstructor
public class PositionController {

    private final PositionService positionService;

    @GetMapping
    @RequirePermission("oa:position:list")
    public ApiResponse<PageResult<SysPosition>> page(PositionQuery query) {
        return ApiResponse.success(positionService.page(query));
    }

    /** 供员工档案等表单下拉使用，仅返回启用岗位。 */
    @GetMapping("/enabled")
    @RequirePermission("oa:position:list")
    public ApiResponse<List<SysPosition>> listEnabled() {
        return ApiResponse.success(positionService.listEnabled());
    }

    @PostMapping
    @RequirePermission("oa:position:save")
    public ApiResponse<Long> create(@Valid @RequestBody PositionSaveRequest request) {
        return ApiResponse.success(positionService.create(request));
    }

    @PutMapping("/{positionId}")
    @RequirePermission("oa:position:save")
    public ApiResponse<Void> update(@PathVariable Long positionId, @Valid @RequestBody PositionSaveRequest request) {
        positionService.update(positionId, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{positionId}")
    @RequirePermission("oa:position:delete")
    public ApiResponse<Void> delete(@PathVariable Long positionId) {
        positionService.delete(positionId);
        return ApiResponse.success();
    }
}
