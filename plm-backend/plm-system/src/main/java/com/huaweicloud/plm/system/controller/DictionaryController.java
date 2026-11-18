package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.DictionaryQuery;
import com.huaweicloud.plm.system.dto.DictionarySaveRequest;
import com.huaweicloud.plm.system.entity.SysDictionary;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.DictionaryService;
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

@RestController
@RequestMapping("/system/dictionaries")
@RequiredArgsConstructor
public class DictionaryController {

    private final DictionaryService dictionaryService;

    @GetMapping
    @RequirePermission("system:dict:list")
    public ApiResponse<PageResult<SysDictionary>> page(DictionaryQuery query) {
        return ApiResponse.success(dictionaryService.page(query));
    }

    /** 供各业务页面下拉使用，仅返回启用项。 */
    @GetMapping("/by-type")
    @RequirePermission("system:dict:list")
    public ApiResponse<List<SysDictionary>> listByType(@RequestParam String dictType) {
        return ApiResponse.success(dictionaryService.listByType(dictType));
    }

    @PostMapping
    @RequirePermission("system:dict:create")
    public ApiResponse<Long> create(@Valid @RequestBody DictionarySaveRequest request) {
        return ApiResponse.success(dictionaryService.create(request));
    }

    @PutMapping("/{dictId}")
    @RequirePermission("system:dict:update")
    public ApiResponse<Void> update(@PathVariable Long dictId, @Valid @RequestBody DictionarySaveRequest request) {
        dictionaryService.update(dictId, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{dictId}")
    @RequirePermission("system:dict:delete")
    public ApiResponse<Void> delete(@PathVariable Long dictId) {
        dictionaryService.delete(dictId);
        return ApiResponse.success();
    }
}
