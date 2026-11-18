package com.huaweicloud.plm.gateway.filter;

import cn.hutool.core.util.IdUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Slf4j
@Component
public class TraceIdFilter implements GlobalFilter, Ordered {

    private static final String TRACE_ID_HEADER = "X-Trace-Id";

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String traceId = exchange.getRequest().getHeaders().getFirst(TRACE_ID_HEADER);
        if (traceId == null || traceId.isEmpty()) {
            traceId = IdUtil.fastSimpleUUID();
        }
        final String finalTraceId = traceId;
        ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                .header(TRACE_ID_HEADER, finalTraceId)
                .build();
        // 在响应提交前写入 traceId：此时下游响应头已复制完成，使用 set 可避免与下游重复的 X-Trace-Id
        exchange.getResponse().beforeCommit(() -> {
            exchange.getResponse().getHeaders().set(TRACE_ID_HEADER, finalTraceId);
            return Mono.empty();
        });
        ServerWebExchange mutatedExchange = exchange.mutate()
                .request(mutatedRequest)
                .build();
        log.info("[请求入口] traceId={}, method={}, path={}",
                finalTraceId,
                exchange.getRequest().getMethod(),
                exchange.getRequest().getURI().getPath());
        return chain.filter(mutatedExchange)
                .doOnSuccess(v -> log.info("[请求出口] traceId={}, status={}",
                        finalTraceId, exchange.getResponse().getStatusCode()))
                .doOnError(e -> log.error("[请求异常] traceId={}, error={}", finalTraceId, e.getMessage()));
    }

    @Override
    public int getOrder() {
        return -200;
    }
}