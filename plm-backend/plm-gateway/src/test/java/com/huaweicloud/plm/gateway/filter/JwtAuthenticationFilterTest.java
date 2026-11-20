package com.huaweicloud.plm.gateway.filter;

import org.junit.jupiter.api.Test;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpStatus;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
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
}
