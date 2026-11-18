package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.SrmEdiMessageQuery;
import com.huaweicloud.plm.system.dto.SrmEdiMessageSaveRequest;
import com.huaweicloud.plm.system.entity.SrmEdiMessage;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SrmEdiMessageService;
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
 * EDI 报文接口（对应 EDI 报文）：
 * EDI 报文登记、分页查询与删除。
 */
@RestController
@RequestMapping("/srm/edi/messages")
@RequiredArgsConstructor
public class SrmEdiMessageController {

    private final SrmEdiMessageService service;

    @GetMapping
    @RequirePermission("srm:edi:message:list")
    public ApiResponse<PageResult<SrmEdiMessage>> page(SrmEdiMessageQuery query) {
        return ApiResponse.success(service.page(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("srm:edi:message:list")
    public ApiResponse<SrmEdiMessage> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("srm:edi:message:manage")
    public ApiResponse<Long> create(@Valid @RequestBody SrmEdiMessageSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("srm:edi:message:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody SrmEdiMessageSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("srm:edi:message:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
