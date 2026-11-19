package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MigPlmDocumentCompensationQuery;
import com.huaweicloud.plm.system.dto.MigPlmDocumentCompensationSaveRequest;
import com.huaweicloud.plm.system.entity.MigPlmDocumentCompensation;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MigPlmDocumentCompensationService;
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
 * PLM文档迁移异常补偿接口：PLM文档迁移集成异常补偿的登记、分页查询与删除。
 */
@RestController
@RequestMapping("/mig/plm-document/compensations")
@RequiredArgsConstructor
public class MigPlmDocumentCompensationController {

    private final MigPlmDocumentCompensationService service;

    @GetMapping
    @RequirePermission("mig:plm-document:compensation:list")
    public ApiResponse<PageResult<MigPlmDocumentCompensation>> page(MigPlmDocumentCompensationQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("mig:plm-document:compensation:list")
    public ApiResponse<MigPlmDocumentCompensation> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("mig:plm-document:compensation:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MigPlmDocumentCompensationSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("mig:plm-document:compensation:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody MigPlmDocumentCompensationSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("mig:plm-document:compensation:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
