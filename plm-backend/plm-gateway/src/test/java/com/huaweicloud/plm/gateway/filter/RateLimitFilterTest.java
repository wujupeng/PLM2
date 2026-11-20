package com.huaweicloud.plm.gateway.filter;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.data.redis.RedisConnectionFailureException;
import org.springframework.data.redis.core.ReactiveStringRedisTemplate;
import org.springframework.data.redis.core.ReactiveValueOperations;
import org.springframework.http.HttpStatus;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class RateLimitFilterTest {

    private final ReactiveStringRedisTemplate redisTemplate = mock(ReactiveStringRedisTemplate.class);
    @SuppressWarnings("unchecked")
    private final ReactiveValueOperations<String, String> valueOperations = mock(ReactiveValueOperations.class);
    private final GatewayFilterChain chain = mock(GatewayFilterChain.class);
    private final MockServerWebExchange exchange = MockServerWebExchange.from(
            MockServerHttpRequest.get("/api/system/users").build());
    private RateLimitFilter filter;

    @BeforeEach
    void setUp() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        filter = new RateLimitFilter(redisTemplate);
    }

    @Test
    void fallsBackToLocalLimitWhenRedisIsUnavailable() {
        when(valueOperations.increment(anyString()))
                .thenReturn(Mono.error(new RedisConnectionFailureException("test outage")));
        when(chain.filter(exchange)).thenReturn(Mono.empty());

        StepVerifier.create(filter.filter(exchange, chain)).verifyComplete();

        verify(chain, times(1)).filter(exchange);
    }

    @Test
    void doesNotRetryDownstreamFailuresAsRedisFailures() {
        RuntimeException downstreamFailure = new RuntimeException("downstream failure");
        when(valueOperations.increment(anyString())).thenReturn(Mono.just(1L));
        when(redisTemplate.expire(anyString(), any(Duration.class))).thenReturn(Mono.just(true));
        when(chain.filter(exchange)).thenReturn(Mono.error(downstreamFailure));

        StepVerifier.create(filter.filter(exchange, chain))
                .expectErrorMatches(error -> error == downstreamFailure)
                .verify();

        verify(chain, times(1)).filter(exchange);
    }

    @Test
    void restoresRedisRateLimitAfterConnectionRecovers() {
        MockServerWebExchange recoveryExchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/api/system/users").build());
        when(valueOperations.increment(anyString()))
                .thenReturn(Mono.error(new RedisConnectionFailureException("test outage")))
                .thenReturn(Mono.just(101L));
        when(chain.filter(exchange)).thenReturn(Mono.empty());

        StepVerifier.create(filter.filter(exchange, chain)).verifyComplete();
        StepVerifier.create(filter.filter(recoveryExchange, chain)).verifyComplete();

        verify(chain, times(1)).filter(exchange);
        verify(chain, never()).filter(recoveryExchange);
        assertEquals(HttpStatus.TOO_MANY_REQUESTS, recoveryExchange.getResponse().getStatusCode());
    }
}
