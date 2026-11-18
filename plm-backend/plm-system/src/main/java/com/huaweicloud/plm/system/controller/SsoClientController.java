package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.SsoClientQuery;
import com.huaweicloud.plm.system.dto.SsoClientSaveRequest;
import com.huaweicloud.plm.system.dto.SsoTokenRequest;
import com.huaweicloud.plm.system.dto.SsoTokenResponse;
import com.huaweicloud.plm.system.entity.SysSsoClient;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.SsoClientService;
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

@RestController
@RequestMapping("/oa/sso-clients")
@RequiredArgsConstructor
public class SsoClientController {

    private final SsoClientService ssoClientService;

    @GetMapping
    @RequirePermission("oa:sso:list")
    public ApiResponse<PageResult<SysSsoClient>> page(SsoClientQuery query) {
        return ApiResponse.success(ssoClientService.page(query));
    }

    @PostMapping
    @RequirePermission("oa:sso:save")
    public ApiResponse<Long> create(@Valid @RequestBody SsoClientSaveRequest request) {
        return ApiResponse.success(ssoClientService.create(request));
    }

    @PutMapping("/{id}")
    @RequirePermission("oa:sso:save")
    public ApiResponse<Void> update(@PathVariable Long id, @Valid @RequestBody SsoClientSaveRequest request) {
        ssoClientService.update(id, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{id}")
    @RequirePermission("oa:sso:delete")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        ssoClientService.delete(id);
        return ApiResponse.success();
    }

    /**
     * 单点登录令牌签发入口，不要求平台登录态：
     * 调用方以客户端凭证 + 用户凭证（password）或仅客户端凭证（client_credentials）换取令牌。
     */
    @PostMapping("/token")
    public ApiResponse<SsoTokenResponse> token(@Valid @RequestBody SsoTokenRequest request) {
        return ApiResponse.success(ssoClientService.issueToken(request));
    }
}
