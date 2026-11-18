package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.CadAttrMappingQuery;
import com.huaweicloud.plm.system.dto.CadAttrMappingSaveRequest;
import com.huaweicloud.plm.system.entity.CadAttrMapping;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.CadFileService;
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
 * CAD 属性映射配置接口（DEV-033 ~ DEV-038）。
 */
@RestController
@RequestMapping("/cad/attr-mappings")
@RequiredArgsConstructor
public class CadAttrMappingController {

    private final CadFileService cadFileService;

    @GetMapping
    @RequirePermission("cad:mapping:list")
    public ApiResponse<PageResult<CadAttrMapping>> page(CadAttrMappingQuery query) {
        return ApiResponse.success(cadFileService.pageMappings(query));
    }

    @PostMapping
    @RequirePermission("cad:mapping:save")
    public ApiResponse<Long> create(@Valid @RequestBody CadAttrMappingSaveRequest request) {
        return ApiResponse.success(cadFileService.createMapping(request));
    }

    @PutMapping("/{mappingId}")
    @RequirePermission("cad:mapping:save")
    public ApiResponse<Void> update(@PathVariable Long mappingId,
                                    @Valid @RequestBody CadAttrMappingSaveRequest request) {
        cadFileService.updateMapping(mappingId, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{mappingId}")
    @RequirePermission("cad:mapping:save")
    public ApiResponse<Void> delete(@PathVariable Long mappingId) {
        cadFileService.deleteMapping(mappingId);
        return ApiResponse.success();
    }
}
