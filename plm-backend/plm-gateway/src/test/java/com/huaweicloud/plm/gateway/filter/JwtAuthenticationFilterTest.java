package com.huaweicloud.plm.gateway.filter;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpStatus;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class JwtAuthenticationFilterTest {

    private static final String TEST_SECRET = "plm2-junit-test-secret-0123456789abcdef0123456789";

    @Test
    void permitsOnlyMinimalActuatorAndAuthenticationEndpoints() {
        JwtAuthenticationFilter filter = new JwtAuthenticationFilter(TEST_SECRET);
        GatewayFilterChain chain = mock(GatewayFilterChain.class);

        assertAnonymousAllowed(filter, chain, "/actuator/health");
        assertAnonymousAllowed(filter, chain, "/actuator/info");
        assertAnonymousAllowed(filter, chain, "/api/auth/login");
        assertAnonymousRejected(filter, chain, "/actuator/env");
        assertAnonymousRejected(filter, chain, "/actuator/gateway/routes");
        assertAnonymousRejected(filter, chain, "/v3/api-docs");
        assertAnonymousRejected(filter, chain, "/doc.html");
    }

    @Test
    void rejectsJwtSecretsShorterThanHmac256Minimum() {
        org.junit.jupiter.api.Assertions.assertThrows(
                IllegalStateException.class,
                () -> new JwtAuthenticationFilter("too-short"));
    }

    @Test
    void rejectsMalformedExpiredAndWrongSignatureTokens() {
        JwtAuthenticationFilter filter = new JwtAuthenticationFilter(TEST_SECRET);
        GatewayFilterChain chain = mock(GatewayFilterChain.class);

        assertUnauthorized(filter, chain, "not-a-jwt");
        assertUnauthorized(filter, chain, signedToken(TEST_SECRET,
                new Date(System.currentTimeMillis() - 1_000)));
        assertUnauthorized(filter, chain, signedToken("different-junit-test-secret-0123456789abcdef",
                new Date(System.currentTimeMillis() + 60_000)));
    }

    @Test
    void acceptsValidTokenAndForwardsIdentityAndRoles() {
        JwtAuthenticationFilter filter = new JwtAuthenticationFilter(TEST_SECRET);
        GatewayFilterChain chain = mock(GatewayFilterChain.class);
        when(chain.filter(any(ServerWebExchange.class))).thenReturn(Mono.empty());
        MockServerWebExchange exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/api/system/users")
                        .header("Authorization", "Bearer " + signedToken(TEST_SECRET,
                                new Date(System.currentTimeMillis() + 60_000)))
                        .build());

        StepVerifier.create(filter.filter(exchange, chain)).verifyComplete();

        org.mockito.ArgumentCaptor<ServerWebExchange> forwarded =
                org.mockito.ArgumentCaptor.forClass(ServerWebExchange.class);
        verify(chain).filter(forwarded.capture());
        assertEquals("12345", forwarded.getValue().getRequest().getHeaders().getFirst("X-User-Id"));
        assertEquals("test-user", forwarded.getValue().getRequest().getHeaders().getFirst("X-Username"));
        assertEquals("admin,sales", forwarded.getValue().getRequest().getHeaders().getFirst("X-User-Roles"));
    }

    private void assertAnonymousAllowed(JwtAuthenticationFilter filter, GatewayFilterChain chain, String path) {
        MockServerWebExchange exchange = MockServerWebExchange.from(MockServerHttpRequest.get(path).build());
        when(chain.filter(exchange)).thenReturn(Mono.empty());

        StepVerifier.create(filter.filter(exchange, chain)).verifyComplete();

        verify(chain).filter(exchange);
    }

    private void assertAnonymousRejected(JwtAuthenticationFilter filter, GatewayFilterChain chain, String path) {
        MockServerWebExchange exchange = MockServerWebExchange.from(MockServerHttpRequest.get(path).build());
        exchange.getResponse().setWriteHandler(body -> Mono.empty());

        StepVerifier.create(filter.filter(exchange, chain)).verifyComplete();

        assertEquals(HttpStatus.UNAUTHORIZED, exchange.getResponse().getStatusCode());
        verify(chain, never()).filter(exchange);
    }

    private void assertUnauthorized(JwtAuthenticationFilter filter, GatewayFilterChain chain, String token) {
        MockServerWebExchange exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/api/system/users")
                        .header("Authorization", "Bearer " + token)
                        .build());
        exchange.getResponse().setWriteHandler(body -> Mono.empty());

        StepVerifier.create(filter.filter(exchange, chain)).verifyComplete();

        assertEquals(HttpStatus.UNAUTHORIZED, exchange.getResponse().getStatusCode());
        verify(chain, never()).filter(exchange);
    }

    private String signedToken(String secret, Date expiration) {
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        SecretKey key = Keys.hmacShaKeyFor(keyBytes);
        Date now = new Date();
        return Jwts.builder()
                .subject("12345")
                .claim("username", "test-user")
                .claim("roles", List.of("admin", "sales"))
                .issuedAt(now)
                .expiration(expiration)
                .signWith(key)
                .compact();
    }
}
