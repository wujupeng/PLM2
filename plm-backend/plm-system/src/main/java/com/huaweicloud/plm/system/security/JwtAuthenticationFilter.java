package com.huaweicloud.plm.system.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.security.JwtUtils;
import com.huaweicloud.plm.common.security.UserContext;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * JWT 认证过滤器：解析访问令牌并写入用户上下文，未通过认证直接返回 401。
 */
@Component
@Order(10)
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String BEARER_PREFIX = "Bearer ";

    private static final List<String> WHITELIST = List.of(
            "/auth/login",
            "/auth/refresh",
            "/oa/sso-clients/token"
    );

    private final JwtUtils jwtUtils;
    private final ObjectMapper objectMapper;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return WHITELIST.contains(path)
                || path.equals("/actuator/health")
                || path.equals("/actuator/info");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (!StringUtils.hasText(header) || !header.startsWith(BEARER_PREFIX)) {
            writeUnauthorized(response, "缺少访问令牌");
            return;
        }
        Claims claims = jwtUtils.parse(header.substring(BEARER_PREFIX.length()));
        if (claims == null || !jwtUtils.isType(claims, JwtUtils.TYPE_ACCESS)) {
            writeUnauthorized(response, "访问令牌无效或已过期");
            return;
        }
        UserContext.set(new UserContext.Principal(
                Long.valueOf(claims.getSubject()),
                claims.get("username", String.class),
                claims.get("username", String.class),
                null,
                readStringList(claims, "roles"),
                readStringList(claims, "permissions")));
        try {
            filterChain.doFilter(request, response);
        } finally {
            UserContext.clear();
        }
    }

    @SuppressWarnings("unchecked")
    private List<String> readStringList(Claims claims, String key) {
        Object value = claims.get(key);
        return value instanceof List<?> list ? (List<String>) list : List.of();
    }

    private void writeUnauthorized(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(objectMapper.writeValueAsString(
                ApiResponse.failure(ResultCode.UNAUTHORIZED, message)));
    }
}
