package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.OaGoliveFreezeSaveRequest;
import com.huaweicloud.plm.system.dto.OaGoliveQuery;
import com.huaweicloud.plm.system.entity.OaGoliveFreeze;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaGoliveFreezeService;
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
 * 冻结旧OA关键写入接口（OA-DEV-114）：冻结窗口、只读保留、应急预案与通知状态。
 */
@RestController
@RequestMapping("/oa/golive/freezes")
@RequiredArgsConstructor
public class OaGoliveFreezeController {

    private final OaGoliveFreezeService service;

    @GetMapping
    @RequirePermission("oa:golive:freeze:list")
    public ApiResponse<PageResult<OaGoliveFreeze>> page(OaGoliveQuery query) {
        return ApiResponse.success(service.pageFreezes(query));
    }

    @GetMapping("/stats")
    @RequirePermission("oa:golive:freeze:list")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.success(service.stats());
    }

    @GetMapping("/{id}")
    @RequirePermission("oa:golive:freeze:list")
    public ApiResponse<OaGoliveFreeze> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("oa:golive:freeze:manage")
    public ApiResponse<Long> create(@Valid @RequestBody OaGoliveFreezeSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("oa:golive:freeze:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody OaGoliveFreezeSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    /** 生效冻结。 */
    @PostMapping("/{id}/activate")
    @RequirePermission("oa:golive:freeze:manage")
    public ApiResponse<OaGoliveFreeze> activate(@PathVariable Long id) {
        return ApiResponse.success(service.activate(id));
    }

    /** 解除冻结。 */
    @PostMapping("/{id}/release")
    @RequirePermission("oa:golive:freeze:manage")
    public ApiResponse<OaGoliveFreeze> release(@PathVariable Long id) {
        return ApiResponse.success(service.release(id));
    }

    /** 发布冻结通知。 */
    @PostMapping("/{id}/notice")
    @RequirePermission("oa:golive:freeze:manage")
    public ApiResponse<OaGoliveFreeze> notice(@PathVariable Long id) {
        return ApiResponse.success(service.notice(id));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("oa:golive:freeze:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
