package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.EdiMessageMapQuery;
import com.huaweicloud.plm.system.dto.EdiMessageMapSaveRequest;
import com.huaweicloud.plm.system.entity.EdiMessageMap;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.EdiMessageMapService;
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

import java.util.List;

/**
 * EDI 报文映射与标准化接口（N6，DEV-067）。
 */
@RestController
@RequestMapping("/edi/message-maps")
@RequiredArgsConstructor
public class EdiMessageMapController {

    private final EdiMessageMapService ediMessageMapService;

    @GetMapping
    @RequirePermission("edi:map:list")
    public ApiResponse<PageResult<EdiMessageMap>> page(EdiMessageMapQuery query) {
        return ApiResponse.success(ediMessageMapService.page(query));
    }

    @GetMapping("/by-trans")
    @RequirePermission("edi:map:list")
    public ApiResponse<List<EdiMessageMap>> byTrans(
            @RequestParam(required = false) String partnerCode,
            @RequestParam String transCode,
            @RequestParam(required = false, defaultValue = "INBOUND") String direction) {
        return ApiResponse.success(ediMessageMapService.listByTrans(partnerCode, transCode, direction));
    }

    @GetMapping("/{mapId}")
    @RequirePermission("edi:map:list")
    public ApiResponse<EdiMessageMap> detail(@PathVariable Long mapId) {
        return ApiResponse.success(ediMessageMapService.requireById(mapId));
    }

    @PostMapping
    @RequirePermission("edi:map:save")
    public ApiResponse<Long> create(@Valid @RequestBody EdiMessageMapSaveRequest request) {
        return ApiResponse.success(ediMessageMapService.create(request));
    }

    @PutMapping("/{mapId}")
    @RequirePermission("edi:map:save")
    public ApiResponse<Void> update(@PathVariable Long mapId,
                                    @Valid @RequestBody EdiMessageMapSaveRequest request) {
        ediMessageMapService.update(mapId, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{mapId}")
    @RequirePermission("edi:map:delete")
    public ApiResponse<Void> delete(@PathVariable Long mapId) {
        ediMessageMapService.delete(mapId);
        return ApiResponse.success();
    }
}
