package com.huaweicloud.plm.common.context;

import cn.hutool.core.util.IdUtil;

public final class TraceContext {

    private static final ThreadLocal<String> TRACE_ID_HOLDER = new ThreadLocal<>();

    private TraceContext() {}

    public static String currentTraceId() {
        String traceId = TRACE_ID_HOLDER.get();
        if (traceId == null) {
            traceId = IdUtil.fastSimpleUUID();
            TRACE_ID_HOLDER.set(traceId);
        }
        return traceId;
    }

    public static void setTraceId(String traceId) {
        TRACE_ID_HOLDER.set(traceId);
    }

    public static void clear() {
        TRACE_ID_HOLDER.remove();
    }
}