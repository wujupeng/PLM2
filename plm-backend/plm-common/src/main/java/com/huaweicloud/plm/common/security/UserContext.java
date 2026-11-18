package com.huaweicloud.plm.common.security;

import java.util.List;

/**
 * 当前登录用户上下文，基于 ThreadLocal，由认证过滤器写入、请求结束后清理。
 */
public final class UserContext {

    public record Principal(Long userId, String username, String displayName, Long orgId,
                            List<String> roles, List<String> permissions) {

        public boolean hasPermission(String permission) {
            if (permissions == null || permission == null) {
                return false;
            }
            return permissions.contains("*") || permissions.contains(permission);
        }
    }

    private static final ThreadLocal<Principal> HOLDER = new ThreadLocal<>();

    private UserContext() {
    }

    public static void set(Principal principal) {
        HOLDER.set(principal);
    }

    public static Principal get() {
        return HOLDER.get();
    }

    public static Long getUserId() {
        Principal principal = HOLDER.get();
        return principal == null ? null : principal.userId();
    }

    public static String getUsername() {
        Principal principal = HOLDER.get();
        return principal == null ? null : principal.username();
    }

    public static void clear() {
        HOLDER.remove();
    }
}
