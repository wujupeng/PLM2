package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MesCollectRuleQuery;
import com.huaweicloud.plm.system.dto.MesCollectRuleSaveRequest;
import com.huaweicloud.plm.system.entity.MesCollectRule;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MesCollectRuleService;
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
 * 数据校验规则接口：规则登记、分页查询与删除。
 */
@RestController
@RequestMapping("/mes/collect/rules")
@RequiredArgsConstructor
public class MesCollectRuleController {

    private final MesCollectRuleService service;

    @GetMapping
    @RequirePermission("mes:collect:rule:list")
    public ApiResponse<PageResult<MesCollectRule>> page(MesCollectRuleQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("mes:collect:rule:list")
    public ApiResponse<MesCollectRule> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("mes:collect:rule:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MesCollectRuleSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("mes:collect:rule:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody MesCollectRuleSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("mes:collect:rule:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
