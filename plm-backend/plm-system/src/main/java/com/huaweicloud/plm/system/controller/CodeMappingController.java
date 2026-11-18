package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.CodeGenerateRequest;
import com.huaweicloud.plm.system.dto.CodeGenerateResponse;
import com.huaweicloud.plm.system.dto.CodeMappingDetailResponse;
import com.huaweicloud.plm.system.dto.CodeMappingQuery;
import com.huaweicloud.plm.system.dto.CodeVoidRequest;
import com.huaweicloud.plm.system.entity.CodeMapping;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.CodeGenerationService;
import com.huaweicloud.plm.system.service.CodeMappingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 原码到新码映射接口（N5）。
 */
@RestController
@RequestMapping("/code/mappings")
@RequiredArgsConstructor
public class CodeMappingController {

    private final CodeMappingService codeMappingService;
    private final CodeGenerationService codeGenerationService;

    @GetMapping
    @RequirePermission("relabel:workbench")
    public ApiResponse<PageResult<CodeMapping>> page(CodeMappingQuery query) {
        return ApiResponse.success(codeMappingService.page(query));
    }

    @GetMapping("/{mappingId}")
    @RequirePermission("relabel:workbench")
    public ApiResponse<CodeMappingDetailResponse> detail(@PathVariable Long mappingId) {
        return ApiResponse.success(codeMappingService.detail(mappingId));
    }

    @GetMapping("/by-source/{sourceCode}")
    @RequirePermission("relabel:workbench")
    public ApiResponse<CodeMapping> findBySource(@PathVariable String sourceCode) {
        return ApiResponse.success(codeMappingService.findBySource(sourceCode));
    }

    @GetMapping("/by-target/{targetCode}")
    @RequirePermission("relabel:workbench")
    public ApiResponse<CodeMapping> findByTarget(@PathVariable String targetCode) {
        return ApiResponse.success(codeMappingService.findByTarget(targetCode));
    }

    @PostMapping("/generate")
    @RequirePermission("relabel:scan")
    public ApiResponse<CodeGenerateResponse> generate(@Valid @RequestBody CodeGenerateRequest request) {
        return ApiResponse.success(codeGenerationService.generate(request));
    }

    @PostMapping("/{mappingId}/void")
    @RequirePermission("relabel:scan")
    public ApiResponse<Void> voidMapping(@PathVariable Long mappingId,
                                         @RequestBody(required = false) CodeVoidRequest request) {
        codeMappingService.voidMapping(mappingId, request == null ? null : request.getReason());
        return ApiResponse.success();
    }
}
