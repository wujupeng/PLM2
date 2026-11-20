package com.huaweicloud.plm.gateway.filter;

import io.lettuce.core.RedisCommandExecutionException;
import io.lettuce.core.RedisCommandTimeoutException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.data.redis.core.ReactiveStringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.net.ConnectException;
import java.net.SocketTimeoutException;
import java.time.Duration;
import java.util.concurrent.TimeoutException;
import java.util.concurrent.atomic.AtomicBoolean;

@Slf4j
@Component
public class RateLimitFilter implements GlobalFilter, Ordered {

    private static final String RATE_LIMIT_PREFIX = "plm:rate_limit:";
    private static final int DEFAULT_LIMIT_PER_SECOND = 100;
    private static final Duration WINDOW = Duration.ofSeconds(1);

    private final ReactiveStringRedisTemplate redisTemplate;
    private final AtomicBoolean redisUnavailable = new AtomicBoolean();
    private final long localLimit = 1000;
    private long localWindowStartedAt = System.nanoTime();
    private long localCounter;

    public RateLimitFilter(ReactiveStringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String clientIp = extractClientIp(exchange);
        String key = RATE_LIMIT_PREFIX + clientIp;

        Mono<RateLimitCount> redisCount = redisTemplate.opsForValue().increment(key)
                .flatMap(count -> {
                    if (count == 1) {
                        return redisTemplate.expire(key, WINDOW)
                                .thenReturn(count);
                    }
                    return Mono.just(count);
                })
                .doOnNext(count -> {
                    if (redisUnavailable.compareAndSet(true, false)) {
                        log.info("[限流恢复] Redis连接已恢复");
                    }
                })
                .map(count -> new RateLimitCount(count, false));

        return redisCount
                .onErrorResume(e -> {
                    if (redisUnavailable.compareAndSet(false, true)) {
                        log.warn("[限流降级] Redis不可用，启用本地限流，category={}", redisFailureCategory(e));
                    }
                    return Mono.just(new RateLimitCount(incrementLocalCounter(), true));
                })
                .flatMap(count -> {
                    if (count.value() > (count.localFallback() ? localLimit : DEFAULT_LIMIT_PER_SECOND)) {
                        return tooManyRequests(exchange);
                    }
                    return chain.filter(exchange);
                });
    }

    private record RateLimitCount(long value, boolean localFallback) {
    }

    private String redisFailureCategory(Throwable error) {
        for (Throwable cause = error; cause != null; cause = cause.getCause()) {
            if (cause instanceof RedisCommandExecutionException) {
                String message = cause.getMessage();
                if (message != null && (message.contains("NOAUTH") || message.contains("WRONGPASS"))) {
                    return "authentication";
                }
            }
            if (cause instanceof RedisCommandTimeoutException
                    || cause instanceof SocketTimeoutException
                    || cause instanceof TimeoutException) {
                return "timeout";
            }
            if (cause instanceof ConnectException) {
                return "connection-refused";
            }
        }
        return error.getClass().getSimpleName();
    }

    private synchronized long incrementLocalCounter() {
        long now = System.nanoTime();
        if (now - localWindowStartedAt >= WINDOW.toNanos()) {
            localWindowStartedAt = now;
            localCounter = 0;
        }
        return ++localCounter;
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