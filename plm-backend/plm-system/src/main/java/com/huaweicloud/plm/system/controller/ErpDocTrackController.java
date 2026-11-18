package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.ErpDocTrackQuery;
import com.huaweicloud.plm.system.dto.ErpDocTrackSaveRequest;
import com.huaweicloud.plm.system.entity.ErpDocTrack;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.ErpDocTrackService;
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
 * 单据追溯接口（对应 WBS G3-N7a ERP 业务单据追踪）：
 * 单据追溯登记、分页查询与删除。
 */
@RestController
@RequestMapping("/erp/trace/docs")
@RequiredArgsConstructor
public class ErpDocTrackController {

    private final ErpDocTrackService service;

    @GetMapping
    @RequirePermission("erp:trace:doc:list")
    public ApiResponse<PageResult<ErpDocTrack>> page(ErpDocTrackQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("erp:trace:doc:list")
    public ApiResponse<ErpDocTrack> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("erp:trace:doc:manage")
    public ApiResponse<Long> create(@Valid @RequestBody ErpDocTrackSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("erp:trace:doc:manage")
    public ApiResponse<Void> update(@PathVariable Long id, @Valid @RequestBody ErpDocTrackSaveRequest request) {
        service.save(id, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{id}")
    @RequirePermission("erp:trace:doc:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
