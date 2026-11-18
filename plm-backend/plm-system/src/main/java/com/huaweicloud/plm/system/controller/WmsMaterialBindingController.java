package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.WmsBindingQuery;
import com.huaweicloud.plm.system.dto.WmsBindingSaveRequest;
import com.huaweicloud.plm.system.entity.WmsMaterialBinding;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.WmsMaterialBindingService;
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

/**
 * 防混料绑定接口（N7，DEV-080）。
 */
@RestController
@RequestMapping("/wms/bindings")
@RequiredArgsConstructor
public class WmsMaterialBindingController {

    private final WmsMaterialBindingService wmsMaterialBindingService;

    @GetMapping
    @RequirePermission("wms:binding:list")
    public ApiResponse<PageResult<WmsMaterialBinding>> page(WmsBindingQuery query) {
        return ApiResponse.success(wmsMaterialBindingService.page(query));
    }

    @GetMapping("/effective")
    @RequirePermission("wms:binding:list")
    public ApiResponse<WmsMaterialBinding> effective(@RequestParam String lineCode,
                                                     @RequestParam(required = false) String workStation,
                                                     @RequestParam String materialCode) {
        return ApiResponse.success(wmsMaterialBindingService.findEffective(lineCode, workStation, materialCode));
    }

    @GetMapping("/{id}")
    @RequirePermission("wms:binding:list")
    public ApiResponse<WmsMaterialBinding> detail(@PathVariable Long id) {
        return ApiResponse.success(wmsMaterialBindingService.requireBinding(id));
    }

    @PostMapping
    @RequirePermission("wms:binding:save")
    public ApiResponse<Long> create(@Valid @RequestBody WmsBindingSaveRequest request) {
        return ApiResponse.success(wmsMaterialBindingService.create(request));
    }

    @PutMapping("/{id}")
    @RequirePermission("wms:binding:save")
    public ApiResponse<Void> update(@PathVariable Long id,
                                    @Valid @RequestBody WmsBindingSaveRequest request) {
        wmsMaterialBindingService.update(id, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{id}")
    @RequirePermission("wms:binding:save")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        wmsMaterialBindingService.delete(id);
        return ApiResponse.success();
    }
}
