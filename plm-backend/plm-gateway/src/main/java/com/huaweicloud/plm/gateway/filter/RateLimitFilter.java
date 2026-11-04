package com.huaweicloud.plm.gateway.filter;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.data.redis.core.ReactiveStringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.concurrent.atomic.AtomicLong;

@Slf4j
@Component
public class RateLimitFilter implements GlobalFilter, Ordered {

    private static final String RATE_LIMIT_PREFIX = "plm:rate_limit:";
    private static final int DEFAULT_LIMIT_PER_SECOND = 100;
    private static final Duration WINDOW = Duration.ofSeconds(1);

    private final ReactiveStringRedisTemplate redisTemplate;
    private final AtomicLong localCounter = new AtomicLong(0);
    private final long localLimit = 1000;

    public RateLimitFilter(ReactiveStringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String clientIp = extractClientIp(exchange);
        String key = RATE_LIMIT_PREFIX + clientIp;

        return redisTemplate.opsForValue().increment(key)
                .flatMap(count -> {
                    if (count == 1) {
                        return redisTemplate.expire(key, WINDOW)
                                .then(handleCount(exchange, chain, count));
                    }
                    return handleCount(exchange, chain, count);
                })
                .onErrorResume(e -> {
                    log.warn("[限流降级] Redis不可用，启用本地限流, error={}", e.getMessage());
                    long localCount = localCounter.incrementAndGet();
                    if (localCount > localLimit) {
                        return tooManyRequests(exchange);
                    }
                    return chain.filter(exchange);
                });
    }

    private Mono<Void> handleCount(ServerWebExchange exchange, GatewayFilterChain chain, Long count) {
        if (count > DEFAULT_LIMIT_PER_SECOND) {
            log.warn("[限流触发] clientIp={}, count={}", extractClientIp(exchange), count);
            return tooManyRequests(exchange);
        }
        return chain.filter(exchange);
    }

    @Override
    public int getOrder() {
        return -101;
    }

    private String extractClientIp(ServerWebExchange exchange) {
        String xff = exchange.getRequest().getHeaders().getFirst("X-Forwarded-For");
        if (xff != null && !xff.isEmpty()) {
            return xff.split(",")[0].trim();
        }
        return exchange.getRequest().getRemoteAddress() != null
                ? exchange.getRequest().getRemoteAddress().getAddress().getHostAddress()
                : "unknown";
    }

    private Mono<Void> tooManyRequests(ServerWebExchange exchange) {
        exchange.getResponse().setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
        return exchange.getResponse().setComplete();
    }
}