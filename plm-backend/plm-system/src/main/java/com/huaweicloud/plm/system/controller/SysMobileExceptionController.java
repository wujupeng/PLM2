package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MobileExceptionHandleRequest;
import com.huaweicloud.plm.system.dto.MobileExceptionQuery;
import com.huaweicloud.plm.system.dto.MobileExceptionSaveRequest;
import com.huaweicloud.plm.system.entity.SysMobileException;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SysMobileExceptionService;
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
 * 移动异常队列接口（G1-N6 公共平台底座—通用能力 WBS T106 移动端与PDA）：
 * 异常入队登记、处理状态流转（处理中/已解决/已忽略）与删除。
 */
@RestController
@RequestMapping("/platform/mobile/exceptions")
@RequiredArgsConstructor
public class SysMobileExceptionController {

    private final SysMobileExceptionService service;

    @GetMapping
    @RequirePermission("platform:mobile:exception:list")
    public ApiResponse<PageResult<SysMobileException>> page(MobileExceptionQuery query) {
        return ApiResponse.success(service.pageExceptions(query));
    }

    @GetMapping("/{id}")
    @RequirePermission("platform:mobile:exception:list")
    public ApiResponse<SysMobileException> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }

    @PostMapping
    @RequirePermission("platform:mobile:exception:manage")
    public ApiResponse<Long> create(@Valid @RequestBody MobileExceptionSaveRequest request) {
        return ApiResponse.success(service.save(null, request));
    }

    @PutMapping("/{id}")
    @RequirePermission("platform:mobile:exception:manage")
    public ApiResponse<Long> update(@PathVariable Long id, @Valid @RequestBody MobileExceptionSaveRequest request) {
        return ApiResponse.success(service.save(id, request));
    }

    /** 处理中：状态置为 HANDLING，处理人置为当前用户。 */
    @PostMapping("/{id}/handle")
    @RequirePermission("platform:mobile:exception:manage")
    public ApiResponse<SysMobileException> handle(@PathVariable Long id) {
        return ApiResponse.success(service.handle(id));
    }

    /** 已解决：状态置为 RESOLVED，记录处理人、处理时间与处理说明（请求体可选）。 */
    @PostMapping("/{id}/resolve")
    @RequirePermission("platform:mobile:exception:manage")
    public ApiResponse<SysMobileException> resolve(
            @PathVariable Long id,
            @RequestBody(required = false) MobileExceptionHandleRequest request) {
        String handleNote = request == null ? null : request.getHandleNote();
        return ApiResponse.success(service.resolve(id, handleNote));
    }

    /** 已忽略：状态置为 IGNORED，记录处理人与处理时间。 */
    @PostMapping("/{id}/ignore")
    @RequirePermission("platform:mobile:exception:manage")
    public ApiResponse<SysMobileException> ignore(@PathVariable Long id) {
        return ApiResponse.success(service.ignore(id));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("platform:mobile:exception:manage")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success();
    }
}
