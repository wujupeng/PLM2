package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.WmsVmiWarningQuery;
import com.huaweicloud.plm.system.dto.WmsVmiWarningSaveRequest;
import com.huaweicloud.plm.system.entity.WmsVmiWarning;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.WmsVmiWarningService;
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

/**
 * VMI 超容量预警接口（G5-N8）：
 * 预警登记、分页查询与删除。
 */
@RestController
@RequestMapping("/wms/vmi/warnings")
@RequiredArgsConstructor
public class WmsVmiWarningController {

    private final WmsVmiWarningService service;

    @GetMapping
    @RequirePermission("wms:vmi:warning:list")
    public ApiResponse<PageResult<WmsVmiWarning>> page(WmsVmiWarningQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("wms:vmi:warning:list")
    public ApiResponse<WmsVmiWarning> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("wms:vmi:warning:manage")
    public ApiResponse<Long> create(@Valid @RequestBody WmsVmiWarningSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("wms:vmi:warning:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody WmsVmiWarningSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("wms:vmi:warning:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
