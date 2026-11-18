package com.huaweicloud.plm.system.service;

import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.JwtUtils;
import com.huaweicloud.plm.common.security.PasswordHasher;
import com.huaweicloud.plm.system.dto.LoginRequest;
import com.huaweicloud.plm.system.dto.LoginResponse;
import com.huaweicloud.plm.system.dto.UserInfoResponse;
import com.huaweicloud.plm.system.entity.SysUser;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserService userService;
    private final JwtUtils jwtUtils;

    public LoginResponse login(LoginRequest request) {
        SysUser user = userService.findByUsername(request.getUsername());
        if (user == null || !PasswordHasher.matches(request.getPassword(), user.getPassword())) {
            log.warn("登录失败，用户名或密码错误: {}", request.getUsername());
            throw new BusinessException(ResultCode.UNAUTHORIZED, "用户名或密码错误");
        }
        if (user.getStatus() == null || user.getStatus() != 1) {
            throw new BusinessException(ResultCode.FORBIDDEN, "用户已停用，请联系管理员");
        }
        userService.recordLoginSuccess(user.getId());
        return issueTokens(user.getId());
    }

    public LoginResponse refresh(String refreshToken) {
        Claims claims = jwtUtils.parse(refreshToken);
        if (claims == null || !jwtUtils.isType(claims, JwtUtils.TYPE_REFRESH)) {
            throw new BusinessException(ResultCode.UNAUTHORIZED, "刷新令牌无效或已过期");
        }
        Long userId = Long.valueOf(claims.getSubject());
        return issueTokens(userId);
    }

    public UserInfoResponse currentUser(Long userId) {
        if (userId == null) {
            throw new BusinessException(ResultCode.UNAUTHORIZED, "未获取到登录用户");
        }
        return userService.buildUserInfo(userId);
    }

    /**
     * 访问令牌内嵌角色与权限，服务端无状态校验，无需每次请求回查数据库。
     */
    private LoginResponse issueTokens(Long userId) {
        UserInfoResponse userInfo = userService.buildUserInfo(userId);
        List<String> roles = userInfo.getRoles() == null ? List.of() : userInfo.getRoles();
        List<String> permissions = userInfo.getPermissions() == null ? List.of() : userInfo.getPermissions();

        String accessToken = jwtUtils.generateAccessToken(userId, userInfo.getUsername(),
                Map.of("roles", roles, "permissions", permissions));
        String refreshToken = jwtUtils.generateRefreshToken(userId, userInfo.getUsername());

        LoginResponse response = new LoginResponse();
        response.setAccessToken(accessToken);
        response.setRefreshToken(refreshToken);
        response.setExpiresIn(jwtUtils.getAccessTokenExpiration());
        response.setUserInfo(userInfo);
        return response;
    }
}
