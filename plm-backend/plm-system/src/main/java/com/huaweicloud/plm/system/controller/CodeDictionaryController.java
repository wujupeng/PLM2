package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.CodeDictionaryQuery;
import com.huaweicloud.plm.system.dto.CodeDictionarySaveRequest;
import com.huaweicloud.plm.system.entity.CodeDictionary;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.CodeDictionaryService;
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
 * 统一码表接口（DEV-053）。
 */
@RestController
@RequestMapping("/code/dictionaries")
@RequiredArgsConstructor
public class CodeDictionaryController {

    private final CodeDictionaryService codeDictionaryService;

    @GetMapping
    @RequirePermission("code:dict:list")
    public ApiResponse<PageResult<CodeDictionary>> page(CodeDictionaryQuery query) {
        return ApiResponse.success(codeDictionaryService.page(query));
    }

    @GetMapping("/types")
    @RequirePermission("code:dict:list")
    public ApiResponse<List<String>> types() {
        return ApiResponse.success(codeDictionaryService.listTypes());
    }

    @GetMapping("/options")
    @RequirePermission("code:dict:list")
    public ApiResponse<List<CodeDictionary>> options(@RequestParam String dictType) {
        return ApiResponse.success(codeDictionaryService.listByType(dictType));
    }

    @GetMapping("/{dictId}")
    @RequirePermission("code:dict:list")
    public ApiResponse<CodeDictionary> detail(@PathVariable Long dictId) {
        return ApiResponse.success(codeDictionaryService.requireDictionary(dictId));
    }

    @PostMapping
    @RequirePermission("code:dict:save")
    public ApiResponse<Long> create(@Valid @RequestBody CodeDictionarySaveRequest request) {
        return ApiResponse.success(codeDictionaryService.create(request));
    }

    @PutMapping("/{dictId}")
    @RequirePermission("code:dict:save")
    public ApiResponse<Void> update(@PathVariable Long dictId,
                                    @Valid @RequestBody CodeDictionarySaveRequest request) {
        codeDictionaryService.update(dictId, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{dictId}")
    @RequirePermission("code:dict:delete")
    public ApiResponse<Void> delete(@PathVariable Long dictId) {
        codeDictionaryService.delete(dictId);
        return ApiResponse.success();
    }
}
