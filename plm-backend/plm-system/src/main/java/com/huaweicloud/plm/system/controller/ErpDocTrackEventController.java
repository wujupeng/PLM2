package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ErpDocTrackEventQuery;
import com.huaweicloud.plm.system.dto.ErpDocTrackEventSaveRequest;
import com.huaweicloud.plm.system.entity.ErpDocTrackEvent;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ErpDocTrackEventService;
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
 * 业务事件接口（对应 WBS G3-N7a ERP 业务单据追踪）：
 * 业务事件登记、分页查询与删除。
 */
@RestController
@RequestMapping("/erp/trace/events")
@RequiredArgsConstructor
public class ErpDocTrackEventController {

    private final ErpDocTrackEventService service;

    @GetMapping
    @RequirePermission("erp:trace:event:list")
    public ApiResponse<PageResult<ErpDocTrackEvent>> page(ErpDocTrackEventQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("erp:trace:event:list")
    public ApiResponse<ErpDocTrackEvent> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("erp:trace:event:manage")
    public ApiResponse<Long> create(@Valid @RequestBody ErpDocTrackEventSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("erp:trace:event:manage")
    public ApiResponse<Void> update(@PathVariable Long id, @Valid @RequestBody ErpDocTrackEventSaveRequest request) {
        service.save(id, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{id}")
    @RequirePermission("erp:trace:event:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
