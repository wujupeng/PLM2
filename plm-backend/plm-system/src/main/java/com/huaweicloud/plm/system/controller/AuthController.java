package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.LoginRequest;
import com.huaweicloud.plm.system.dto.LoginResponse;
import com.huaweicloud.plm.system.dto.RefreshTokenRequest;
import com.huaweicloud.plm.system.dto.UserInfoResponse;
import com.huaweicloud.plm.system.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.success(authService.login(request));
    }

    @PostMapping("/refresh")
    public ApiResponse<LoginResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return ApiResponse.success(authService.refresh(request.getRefreshToken()));
    }

    /**
     * 令牌为无状态 JWT，登出由前端清除本地令牌；如需强制失效需接入 Redis 黑名单。
     */
    @PostMapping("/logout")
    public ApiResponse<Void> logout() {
        return ApiResponse.success();
    }

    @GetMapping("/me")
    public ApiResponse<UserInfoResponse> currentUser() {
        return ApiResponse.success(authService.currentUser(UserContext.getUserId()));
    }
}
