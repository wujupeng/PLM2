package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MigPlmDocumentInterfaceQuery;
import com.huaweicloud.plm.system.dto.MigPlmDocumentInterfaceSaveRequest;
import com.huaweicloud.plm.system.entity.MigPlmDocumentInterface;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MigPlmDocumentInterfaceService;
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
 * 集成接口定义接口：PLM文档迁移集成接口配置的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/mig/plm-document/interfaces")
@RequiredArgsConstructor
public class MigPlmDocumentInterfaceController {

    private final MigPlmDocumentInterfaceService service;

    @GetMapping
    @RequirePermission("mig:plm-document:interface:list")
    public ApiResponse<PageResult<MigPlmDocumentInterface>> page(MigPlmDocumentInterfaceQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("mig:plm-document:interface:list")
    public ApiResponse<MigPlmDocumentInterface> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("mig:plm-document:interface:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MigPlmDocumentInterfaceSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("mig:plm-document:interface:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody MigPlmDocumentInterfaceSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("mig:plm-document:interface:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
