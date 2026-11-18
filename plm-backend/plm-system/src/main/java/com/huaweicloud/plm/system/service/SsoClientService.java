package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.JwtUtils;
import com.huaweicloud.plm.common.security.PasswordHasher;
import com.huaweicloud.plm.system.dto.SsoClientQuery;
import com.huaweicloud.plm.system.dto.SsoClientSaveRequest;
import com.huaweicloud.plm.system.dto.SsoTokenRequest;
import com.huaweicloud.plm.system.dto.SsoTokenResponse;
import com.huaweicloud.plm.system.dto.UserInfoResponse;
import com.huaweicloud.plm.system.entity.SysSsoClient;
import com.huaweicloud.plm.system.entity.SysUser;
import com.huaweicloud.plm.system.mapper.SysSsoClientMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SsoClientService {

    public static final String GRANT_PASSWORD = "password";
    public static final String GRANT_CLIENT_CREDENTIALS = "client_credentials";
    private static final String MASKED_SECRET = "******";

    private final SysSsoClientMapper ssoClientMapper;
    private final UserService userService;
    private final JwtUtils jwtUtils;

    public PageResult<SysSsoClient> page(SsoClientQuery query) {
        Page<SysSsoClient> page = query.toPage();
        ssoClientMapper.selectPage(page, Wrappers.<SysSsoClient>lambdaQuery()
                .eq(StringUtils.hasText(query.getStatus()), SysSsoClient::getStatus, query.getStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysSsoClient::getClientId, query.getKeyword()).or()
                        .like(SysSsoClient::getClientName, query.getKeyword()))
                .orderByAsc(SysSsoClient::getClientId));
        return PageResult.of(page, this::maskSecret);
    }

    public Long create(SsoClientSaveRequest request) {
        if (ssoClientMapper.countByClientId(request.getClientId(), -1L) > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "客户端 ID 已存在: " + request.getClientId());
        }
        if (!StringUtils.hasText(request.getClientSecret())) {
            throw new BusinessException("新建 SSO 客户端必须设置密钥");
        }
        SysSsoClient client = new SysSsoClient();
        applyRequest(client, request, true);
        ssoClientMapper.insert(client);
        return client.getId();
    }

    public void update(Long id, SsoClientSaveRequest request) {
        SysSsoClient client = requireClient(id);
        if (ssoClientMapper.countByClientId(request.getClientId(), id) > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "客户端 ID 已存在: " + request.getClientId());
        }
        applyRequest(client, request, false);
        ssoClientMapper.updateById(client);
    }

    public void delete(Long id) {
        requireClient(id);
        ssoClientMapper.deleteById(id);
    }

    /**
     * 单点登录令牌签发：
     * password 模式以用户身份换取令牌（供第三方系统免登进入 OA 或 OA 免登进入第三方系统）；
     * client_credentials 模式以客户端身份换取机机令牌，权限取自客户端授权范围。
     */
    public SsoTokenResponse issueToken(SsoTokenRequest request) {
        SysSsoClient client = requireEnabledClient(request.getClientId());
        verifySecret(client, request.getClientSecret());
        ensureGrantTypeSupported(client, request.getGrantType());

        if (GRANT_PASSWORD.equalsIgnoreCase(request.getGrantType())) {
            return issueUserToken(client, request);
        }
        if (GRANT_CLIENT_CREDENTIALS.equalsIgnoreCase(request.getGrantType())) {
            return issueClientToken(client);
        }
        throw new BusinessException("不支持的授权类型: " + request.getGrantType());
    }

    private SsoTokenResponse issueUserToken(SysSsoClient client, SsoTokenRequest request) {
        SysUser user = userService.findByUsername(request.getUsername());
        if (user == null || !PasswordHasher.matches(request.getPassword(), user.getPassword())) {
            throw new BusinessException(ResultCode.UNAUTHORIZED, "用户名或密码错误");
        }
        if (user.getStatus() == null || user.getStatus() != 1) {
            throw new BusinessException(ResultCode.FORBIDDEN, "用户已停用，请联系管理员");
        }
        UserInfoResponse userInfo = userService.buildUserInfo(user.getId());
        List<String> roles = userInfo.getRoles() == null ? List.of() : userInfo.getRoles();
        List<String> permissions = userInfo.getPermissions() == null ? List.of() : userInfo.getPermissions();
        long ttl = ttlOf(client);
        String token = jwtUtils.generateAccessToken(user.getId(), user.getUsername(),
                Map.of("roles", roles, "permissions", permissions, "client_id", client.getClientId()), ttl);

        SsoTokenResponse response = new SsoTokenResponse();
        response.setAccessToken(token);
        response.setExpiresIn(ttl > 0 ? ttl : jwtUtils.getAccessTokenExpiration());
        response.setScope(client.getScopes());
        response.setUsername(user.getUsername());
        response.setDisplayName(user.getDisplayName());
        return response;
    }

    private SsoTokenResponse issueClientToken(SysSsoClient client) {
        List<String> scopes = splitScopes(client.getScopes());
        long ttl = ttlOf(client);
        String token = jwtUtils.generateAccessToken(0L, client.getClientId(),
                Map.of("roles", List.of("CLIENT"), "permissions", scopes, "client_id", client.getClientId()), ttl);

        SsoTokenResponse response = new SsoTokenResponse();
        response.setAccessToken(token);
        response.setExpiresIn(ttl > 0 ? ttl : jwtUtils.getAccessTokenExpiration());
        response.setScope(client.getScopes());
        response.setUsername(client.getClientId());
        response.setDisplayName(client.getClientName());
        return response;
    }

    private void ensureGrantTypeSupported(SysSsoClient client, String grantType) {
        if (!StringUtils.hasText(client.getGrantTypes())
                || !client.getGrantTypes().toLowerCase().contains(grantType.toLowerCase())) {
            throw new BusinessException(ResultCode.FORBIDDEN,
                    "客户端未授权该授权类型: " + grantType + "，已配置 " + client.getGrantTypes());
        }
    }

    private void verifySecret(SysSsoClient client, String clientSecret) {
        if (!StringUtils.hasText(clientSecret) || !clientSecret.equals(client.getClientSecret())) {
            throw new BusinessException(ResultCode.UNAUTHORIZED, "客户端密钥校验失败");
        }
    }

    private SysSsoClient requireEnabledClient(String clientId) {
        if (!StringUtils.hasText(clientId)) {
            throw new BusinessException("客户端 ID 不能为空");
        }
        SysSsoClient client = ssoClientMapper.selectOne(Wrappers.<SysSsoClient>lambdaQuery()
                .eq(SysSsoClient::getClientId, clientId));
        if (client == null) {
            throw new BusinessException(ResultCode.UNAUTHORIZED, "SSO 客户端不存在: " + clientId);
        }
        if (!"enabled".equals(client.getStatus())) {
            throw new BusinessException(ResultCode.FORBIDDEN, "SSO 客户端已停用: " + clientId);
        }
        return client;
    }

    private SysSsoClient requireClient(Long id) {
        SysSsoClient client = ssoClientMapper.selectById(id);
        if (client == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "SSO 客户端不存在: " + id);
        }
        return client;
    }

    private SysSsoClient maskSecret(SysSsoClient client) {
        client.setClientSecret(MASKED_SECRET);
        return client;
    }

    private long ttlOf(SysSsoClient client) {
        return client.getTokenTtlSeconds() == null ? 0L : client.getTokenTtlSeconds();
    }

    private List<String> splitScopes(String scopes) {
        if (!StringUtils.hasText(scopes)) {
            return List.of();
        }
        return Arrays.stream(scopes.split(",")).map(String::trim).filter(StringUtils::hasText).toList();
    }

    private void applyRequest(SysSsoClient client, SsoClientSaveRequest request, boolean isCreate) {
        client.setClientId(request.getClientId());
        if (StringUtils.hasText(request.getClientSecret()) && !MASKED_SECRET.equals(request.getClientSecret())) {
            client.setClientSecret(request.getClientSecret());
        } else if (isCreate) {
            client.setClientSecret(request.getClientSecret());
        }
        client.setClientName(request.getClientName());
        client.setRedirectUri(request.getRedirectUri());
        client.setGrantTypes(StringUtils.hasText(request.getGrantTypes())
                ? request.getGrantTypes() : GRANT_CLIENT_CREDENTIALS);
        client.setScopes(request.getScopes());
        client.setTokenTtlSeconds(request.getTokenTtlSeconds() == null ? 3600 : request.getTokenTtlSeconds());
        client.setStatus(StringUtils.hasText(request.getStatus()) ? request.getStatus() : "enabled");
        client.setRemark(request.getRemark());
    }
}
