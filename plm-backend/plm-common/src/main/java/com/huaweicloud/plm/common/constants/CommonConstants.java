package com.huaweicloud.plm.common.constants;

public final class CommonConstants {

    private CommonConstants() {}

    public static final String AUTHORIZATION_HEADER = "Authorization";
    public static final String BEARER_PREFIX = "Bearer ";
    public static final String TRACE_ID_HEADER = "X-Trace-Id";
    public static final String TENANT_ID_HEADER = "X-Tenant-Id";

    public static final String AUDIT_LOG_TOPIC = "plm.audit.log";
    public static final String ECO_EVENT_TOPIC = "plm.eco.state-transition";
    public static final String NOTIFICATION_TOPIC = "plm.notification";

    public static final String STAGE_GATE_PASSED = "PASSED";
    public static final String STAGE_GATE_PENDING = "PENDING";
    public static final String STAGE_GATE_REJECTED = "REJECTED";

    public static final int MAX_BOM_DEPTH = 10;
    public static final long BOM_EXPAND_TIMEOUT_MS = 2000L;
    public static final long QUERY_TIMEOUT_MS = 500L;
    public static final int AUDIT_LOG_RETENTION_YEARS = 3;
}