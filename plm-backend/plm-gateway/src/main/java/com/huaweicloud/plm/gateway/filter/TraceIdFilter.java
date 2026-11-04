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
        ServerWebExchange mutatedExchange = exchange.mutate()
                .request(mutatedRequest)
                .response(exchange.getResponse().mutate()
                        .header(TRACE_ID_HEADER, finalTraceId)
                        .build())
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