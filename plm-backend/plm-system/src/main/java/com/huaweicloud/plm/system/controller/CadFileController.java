package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.CadExtractRequest;
import com.huaweicloud.plm.system.dto.CadExtractResult;
import com.huaweicloud.plm.system.dto.CadFileDetailResponse;
import com.huaweicloud.plm.system.dto.CadFileQuery;
import com.huaweicloud.plm.system.dto.CadFileSaveRequest;
import com.huaweicloud.plm.system.entity.CadExtractError;
import com.huaweicloud.plm.system.entity.CadFile;
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

import java.util.List;

/**
 * CAD 文件与属性提取接口（DEV-033 ~ DEV-038）。
 */
@RestController
@RequestMapping("/cad/files")
@RequiredArgsConstructor
public class CadFileController {

    private final CadFileService cadFileService;

    @GetMapping
    @RequirePermission("cad:list")
    public ApiResponse<PageResult<CadFile>> page(CadFileQuery query) {
        return ApiResponse.success(cadFileService.page(query));
    }

    @GetMapping("/{cadFileId}")
    @RequirePermission("cad:list")
    public ApiResponse<CadFileDetailResponse> getById(@PathVariable Long cadFileId) {
        return ApiResponse.success(cadFileService.getDetail(cadFileId));
    }

    @PostMapping
    @RequirePermission("cad:create")
    public ApiResponse<Long> create(@Valid @RequestBody CadFileSaveRequest request) {
        return ApiResponse.success(cadFileService.create(request));
    }

    @PutMapping("/{cadFileId}")
    @RequirePermission("cad:update")
    public ApiResponse<Void> update(@PathVariable Long cadFileId, @Valid @RequestBody CadFileSaveRequest request) {
        cadFileService.update(cadFileId, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{cadFileId}")
    @RequirePermission("cad:delete")
    public ApiResponse<Void> delete(@PathVariable Long cadFileId) {
        cadFileService.delete(cadFileId);
        return ApiResponse.success();
    }

    @PostMapping("/{cadFileId}/extract")
    @RequirePermission("cad:extract")
    public ApiResponse<CadExtractResult> extract(@PathVariable Long cadFileId,
                                                 @RequestBody(required = false) CadExtractRequest request) {
        return ApiResponse.success(cadFileService.extract(cadFileId, request));
    }

    @GetMapping("/{cadFileId}/errors")
    @RequirePermission("cad:list")
    public ApiResponse<List<CadExtractError>> listErrors(@PathVariable Long cadFileId) {
        return ApiResponse.success(cadFileService.listErrors(cadFileId));
    }
}
