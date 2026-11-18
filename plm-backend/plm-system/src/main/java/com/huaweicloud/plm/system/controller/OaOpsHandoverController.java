package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.OaGoliveQuery;
import com.huaweicloud.plm.system.dto.OaOpsHandoverSaveRequest;
import com.huaweicloud.plm.system.entity.OaOpsHandover;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaOpsHandoverService;
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

import java.util.Map;

/**
 * 完成知识转移和质保接口（OA-DEV-121）：运维交接交付物交付、确认与质保期维护。
 */
@RestController
@RequestMapping("/oa/golive/handovers")
@RequiredArgsConstructor
public class OaOpsHandoverController {

    private final OaOpsHandoverService service;

    @GetMapping
    @RequirePermission("oa:golive:handover:list")
    public ApiResponse<PageResult<OaOpsHandover>> page(OaGoliveQuery query) {
        return ApiResponse.success(service.pageHandovers(query));
    }

    @GetMapping("/stats")
    @RequirePermission("oa:golive:handover:list")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.success(service.stats());
    }

    @GetMapping("/{id}")
    @RequirePermission("oa:golive:handover:list")
    public ApiResponse<OaOpsHandover> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("oa:golive:handover:manage")
    public ApiResponse<Long> create(@Valid @RequestBody OaOpsHandoverSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("oa:golive:handover:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody OaOpsHandoverSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    /** 交付交接物。 */
    @PostMapping("/{id}/deliver")
    @RequirePermission("oa:golive:handover:manage")
    public ApiResponse<OaOpsHandover> deliver(@PathVariable Long id,
                                              @RequestParam(required = false) String receiver) {
        return ApiResponse.success(service.deliver(id, receiver));
    }

    /** 确认交接。 */
    @PostMapping("/{id}/confirm")
    @RequirePermission("oa:golive:handover:manage")
    public ApiResponse<OaOpsHandover> confirm(@PathVariable Long id) {
        return ApiResponse.success(service.confirm(id));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("oa:golive:handover:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
