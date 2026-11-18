package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.PortalHomeResponse;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaPortalService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/oa/portal")
@RequiredArgsConstructor
public class OaPortalController {

    private final OaPortalService oaPortalService;

    /** 门户首页聚合数据：登录用户、可见应用与代理授权概览。 */
    @GetMapping("/home")
    @RequirePermission("oa:portal:view")
    public ApiResponse<PortalHomeResponse> home() {
        return ApiResponse.success(oaPortalService.home(UserContext.getUserId()));
    }
}
