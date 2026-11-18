package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MesDispatchQuery;
import com.huaweicloud.plm.system.dto.MesDispatchSaveRequest;
import com.huaweicloud.plm.system.entity.MesDispatch;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MesDispatchService;
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
 * 派工任务接口：派工与工序任务登记、分页查询与删除。
 */
@RestController
@RequestMapping("/mes/plan/dispatches")
@RequiredArgsConstructor
public class MesDispatchController {

    private final MesDispatchService service;

    @GetMapping
    @RequirePermission("mes:plan:dispatch:list")
    public ApiResponse<PageResult<MesDispatch>> page(MesDispatchQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("mes:plan:dispatch:list")
    public ApiResponse<MesDispatch> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("mes:plan:dispatch:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MesDispatchSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("mes:plan:dispatch:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody MesDispatchSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("mes:plan:dispatch:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
