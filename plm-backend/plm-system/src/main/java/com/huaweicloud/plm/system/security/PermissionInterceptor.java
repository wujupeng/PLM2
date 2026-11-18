package com.huaweicloud.plm.system.security;

import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Arrays;

/**
 * 权限校验拦截器：依据访问令牌中的权限声明进行校验，避免每次请求回查数据库。
 */
@Component
public class PermissionInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if (!(handler instanceof HandlerMethod handlerMethod)) {
            return true;
        }
        RequirePermission annotation = handlerMethod.getMethodAnnotation(RequirePermission.class);
        if (annotation == null) {
            annotation = handlerMethod.getBeanType().getAnnotation(RequirePermission.class);
        }
        if (annotation == null) {
            return true;
        }
        UserContext.Principal principal = UserContext.get();
        if (principal == null) {
            throw new BusinessException(ResultCode.UNAUTHORIZED, "未获取到登录用户");
        }
        String[] required = annotation.value();
        boolean allowed = Arrays.stream(required).anyMatch(principal::hasPermission);
        if (!allowed) {
            throw new BusinessException(ResultCode.FORBIDDEN,
                    "缺少权限: " + String.join(",", required) + (StringUtils.hasText(principal.username())
                            ? "，当前用户 " + principal.username() : ""));
        }
        return true;
    }
}
