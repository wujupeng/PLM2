package com.huaweicloud.plm.common.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;

/**
 * JWT 生成与解析工具。
 */
@Component
public class JwtUtils {

    public static final String CLAIM_TYPE = "type";
    public static final String TYPE_ACCESS = "access";
    public static final String TYPE_REFRESH = "refresh";

    private final JwtProperties properties;
    private final SecretKey key;

    public JwtUtils(JwtProperties properties) {
        this.properties = properties;
        this.key = Keys.hmacShaKeyFor(properties.getSecret().getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken(Long userId, String username, Map<String, Object> extraClaims) {
        return generate(userId, username, TYPE_ACCESS, properties.getAccessTokenExpiration(), extraClaims);
    }

    /**
     * 按指定有效期签发访问令牌，用于单点登录客户端自定义令牌时长。
     */
    public String generateAccessToken(Long userId, String username, Map<String, Object> extraClaims,
                                      long expirationSeconds) {
        long ttl = expirationSeconds > 0 ? expirationSeconds : properties.getAccessTokenExpiration();
        return generate(userId, username, TYPE_ACCESS, ttl, extraClaims);
    }

    public String generateRefreshToken(Long userId, String username) {
        return generate(userId, username, TYPE_REFRESH, properties.getRefreshTokenExpiration(), Map.of());
    }

    private String generate(Long userId, String username, String type, long expirationSeconds,
                            Map<String, Object> extraClaims) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationSeconds * 1000L);
        return Jwts.builder()
                .issuer(properties.getIssuer())
                .subject(String.valueOf(userId))
                .claim("username", username)
                .claim(CLAIM_TYPE, type)
                .claims(extraClaims == null ? Map.of() : extraClaims)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(key)
                .compact();
    }

    /**
     * 解析令牌，签名或有效期不合法时返回 null。
     */
    public Claims parse(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(key)
                    .requireIssuer(properties.getIssuer())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (JwtException | IllegalArgumentException ex) {
            return null;
        }
    }

    public boolean isType(Claims claims, String type) {
        return claims != null && type.equals(claims.get(CLAIM_TYPE, String.class));
    }

    public long getAccessTokenExpiration() {
        return properties.getAccessTokenExpiration();
    }
}
