package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.WmsFifoRuleQuery;
import com.huaweicloud.plm.system.dto.WmsFifoRuleSaveRequest;
import com.huaweicloud.plm.system.entity.WmsFifoRule;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.WmsFifoRuleService;
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
 * FIFO 规则接口（N7，DEV-079）。
 */
@RestController
@RequestMapping("/wms/fifo-rules")
@RequiredArgsConstructor
public class WmsFifoRuleController {

    private final WmsFifoRuleService wmsFifoRuleService;

    @GetMapping
    @RequirePermission("wms:fifo:list")
    public ApiResponse<PageResult<WmsFifoRule>> page(WmsFifoRuleQuery query) {
        return ApiResponse.success(wmsFifoRuleService.page(query));
    }

    @GetMapping("/active")
    @RequirePermission("wms:fifo:list")
    public ApiResponse<List<WmsFifoRule>> listActive() {
        return ApiResponse.success(wmsFifoRuleService.listActive());
    }

    @GetMapping("/{id}")
    @RequirePermission("wms:fifo:list")
    public ApiResponse<WmsFifoRule> detail(@PathVariable Long id) {
        return ApiResponse.success(wmsFifoRuleService.requireRule(id));
    }

    @PostMapping
    @RequirePermission("wms:fifo:save")
    public ApiResponse<Long> create(@Valid @RequestBody WmsFifoRuleSaveRequest request) {
        return ApiResponse.success(wmsFifoRuleService.create(request));
    }

    @PutMapping("/{id}")
    @RequirePermission("wms:fifo:save")
    public ApiResponse<Void> update(@PathVariable Long id,
                                    @Valid @RequestBody WmsFifoRuleSaveRequest request) {
        wmsFifoRuleService.update(id, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{id}")
    @RequirePermission("wms:fifo:save")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        wmsFifoRuleService.delete(id);
        return ApiResponse.success();
    }
}
