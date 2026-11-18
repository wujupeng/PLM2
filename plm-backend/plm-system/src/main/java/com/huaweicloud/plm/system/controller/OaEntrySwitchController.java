package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.OaEntrySwitchSaveRequest;
import com.huaweicloud.plm.system.dto.OaGoliveQuery;
import com.huaweicloud.plm.system.entity.OaEntrySwitch;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaEntrySwitchService;
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

import java.util.Map;

/**
 * 切换门户入口与身份接口（OA-DEV-116）：入口切换方案、DNS 生效、SSO 与移动端开关、切换结果。
 */
@RestController
@RequestMapping("/oa/golive/entry-switches")
@RequiredArgsConstructor
public class OaEntrySwitchController {

    private final OaEntrySwitchService service;

    @GetMapping
    @RequirePermission("oa:golive:entry:list")
    public ApiResponse<PageResult<OaEntrySwitch>> page(OaGoliveQuery query) {
        return ApiResponse.success(service.pageEntrySwitches(query));
    }

    @GetMapping("/stats")
    @RequirePermission("oa:golive:entry:list")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.success(service.stats());
    }

    @GetMapping("/{id}")
    @RequirePermission("oa:golive:entry:list")
    public ApiResponse<OaEntrySwitch> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("oa:golive:entry:manage")
    public ApiResponse<Long> create(@Valid @RequestBody OaEntrySwitchSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("oa:golive:entry:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody OaEntrySwitchSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    /** 执行入口切换。 */
    @PostMapping("/{id}/cutover")
    @RequirePermission("oa:golive:entry:manage")
    public ApiResponse<OaEntrySwitch> cutover(@PathVariable Long id) {
        return ApiResponse.success(service.cutover(id));
    }

    /** 回滚入口切换。 */
    @PostMapping("/{id}/rollback")
    @RequirePermission("oa:golive:entry:manage")
    public ApiResponse<OaEntrySwitch> rollback(@PathVariable Long id) {
        return ApiResponse.success(service.rollback(id));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("oa:golive:entry:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
