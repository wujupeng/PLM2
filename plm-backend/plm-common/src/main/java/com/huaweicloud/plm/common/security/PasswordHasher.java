package com.huaweicloud.plm.common.security;

import cn.hutool.crypto.digest.BCrypt;

/**
 * 密码散列工具，统一使用 BCrypt。
 */
public final class PasswordHasher {

    private PasswordHasher() {
    }

    public static String encode(String rawPassword) {
        return BCrypt.hashpw(rawPassword, BCrypt.gensalt());
    }

    public static boolean matches(String rawPassword, String hashedPassword) {
        if (rawPassword == null || hashedPassword == null || hashedPassword.isEmpty()) {
            return false;
        }
        try {
            return BCrypt.checkpw(rawPassword, hashedPassword);
        } catch (IllegalArgumentException ex) {
            return false;
        }
    }
}
