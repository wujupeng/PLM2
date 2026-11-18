-- G1-N1 公共平台底座—集成平台（对应总任务书 WBS T009）：
-- API网关、事件总线、消息队列、接口注册、版本管理、重试、幂等、死信和监控。
-- 说明：SQL 同时兼容 PostgreSQL 与 H2（PostgreSQL 兼容模式），主键由应用侧雪花算法生成。
-- 设计原则：
--   1) 接口治理以「接口注册中心 + 版本记录」为主干：登记六大系统之间的 API 契约、协议、方向、
--      超时与 SLA，版本变更留痕并标注兼容性，避免口头约定导致联调返工。
--   2) 消息治理以「事件主题 + 订阅 + 事件消息」为主干：主题定义领域事件与载荷规范，
--      订阅声明下游系统与投递方式，事件消息记录每一次发布与投递结果，支持重试与死信。
--   3) 可靠性以「死信 + 幂等」为保障：投递超过最大重试次数进入死信并人工处理；
--      幂等键防止重复投递导致下游重复入账，是六系统数据互通的前提。
--   4) 可观测以「集成监控」为支撑：按系统/目标/小时汇总成功率与耗时，健康度与告警阈值可配置。
-- 注意：业务字段一律不得命名为 version，避免与 BaseEntity 的乐观锁字段 version 冲突。

-- ========== 接口注册中心（T009） ==========

CREATE TABLE sys_api_registry (
    id            BIGINT       NOT NULL,
    api_code      VARCHAR(64)  NOT NULL,
    api_name      VARCHAR(200) NOT NULL,
    system_code   VARCHAR(32)  NOT NULL,
    direction     VARCHAR(32)  NOT NULL DEFAULT 'OUT',
    protocol      VARCHAR(32)  NOT NULL DEFAULT 'HTTP',
    http_method   VARCHAR(16),
    url_path      VARCHAR(255),
    api_version   VARCHAR(32)  NOT NULL DEFAULT 'v1',
    auth_type     VARCHAR(32)  NOT NULL DEFAULT 'JWT',
    timeout_ms    INT          NOT NULL DEFAULT 5000,
    sla_ms        INT          NOT NULL DEFAULT 2000,
    owner_name    VARCHAR(64),
    api_status    VARCHAR(32)  NOT NULL DEFAULT 'DRAFT',
    description   VARCHAR(1000),
    org_id        BIGINT,
    org_name      VARCHAR(128),
    remark        VARCHAR(500),
    created_by    BIGINT,
    created_at    TIMESTAMP,
    updated_by    BIGINT,
    updated_at    TIMESTAMP,
    deleted       INT          NOT NULL DEFAULT 0,
    version       INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_sys_api_registry_code ON sys_api_registry (api_code);
CREATE INDEX idx_sys_api_registry_system ON sys_api_registry (system_code);
CREATE INDEX idx_sys_api_registry_status ON sys_api_registry (api_status);

-- ========== 接口版本记录（T009） ==========

CREATE TABLE sys_api_version_record (
    id             BIGINT       NOT NULL,
    record_no      VARCHAR(64)  NOT NULL,
    api_code       VARCHAR(64)  NOT NULL,
    api_name       VARCHAR(200),
    version_no     VARCHAR(32)  NOT NULL,
    change_type    VARCHAR(32)  NOT NULL DEFAULT 'MINOR',
    compatibility  VARCHAR(32)  NOT NULL DEFAULT 'COMPATIBLE',
    change_log     VARCHAR(1000),
    release_date   TIMESTAMP,
    version_status VARCHAR(32)  NOT NULL DEFAULT 'DRAFT',
    operator_name  VARCHAR(64),
    org_id         BIGINT,
    org_name       VARCHAR(128),
    remark         VARCHAR(500),
    created_by     BIGINT,
    created_at     TIMESTAMP,
    updated_by     BIGINT,
    updated_at     TIMESTAMP,
    deleted        INT          NOT NULL DEFAULT 0,
    version        INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_sys_api_version_record_no ON sys_api_version_record (record_no);
CREATE INDEX idx_sys_api_version_record_api ON sys_api_version_record (api_code);
CREATE INDEX idx_sys_api_version_record_status ON sys_api_version_record (version_status);

-- ========== 事件主题（T009） ==========

CREATE TABLE sys_event_topic (
    id             BIGINT       NOT NULL,
    topic_code     VARCHAR(64)  NOT NULL,
    topic_name     VARCHAR(200) NOT NULL,
    domain         VARCHAR(64),
    payload_schema TEXT,
    persistent     INT          NOT NULL DEFAULT 1,
    retention_days INT          NOT NULL DEFAULT 30,
    topic_status   VARCHAR(32)  NOT NULL DEFAULT 'DRAFT',
    owner_name     VARCHAR(64),
    description    VARCHAR(1000),
    org_id         BIGINT,
    org_name       VARCHAR(128),
    remark         VARCHAR(500),
    created_by     BIGINT,
    created_at     TIMESTAMP,
    updated_by     BIGINT,
    updated_at     TIMESTAMP,
    deleted        INT          NOT NULL DEFAULT 0,
    version        INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_sys_event_topic_code ON sys_event_topic (topic_code);
CREATE INDEX idx_sys_event_topic_domain ON sys_event_topic (domain);
CREATE INDEX idx_sys_event_topic_status ON sys_event_topic (topic_status);

-- ========== 事件订阅（T009） ==========

CREATE TABLE sys_event_subscription (
    id                 BIGINT       NOT NULL,
    subscription_code  VARCHAR(64)  NOT NULL,
    topic_code         VARCHAR(64)  NOT NULL,
    topic_name         VARCHAR(200),
    subscriber_system  VARCHAR(32)  NOT NULL,
    endpoint           VARCHAR(255),
    delivery_mode      VARCHAR(32)  NOT NULL DEFAULT 'PUSH',
    max_retry          INT          NOT NULL DEFAULT 5,
    retry_interval_sec INT          NOT NULL DEFAULT 30,
    idempotent_enabled INT          NOT NULL DEFAULT 1,
    subscription_status VARCHAR(32) NOT NULL DEFAULT 'ENABLED',
    last_test_result   VARCHAR(32),
    last_test_time     TIMESTAMP,
    operator_name      VARCHAR(64),
    org_id             BIGINT,
    org_name           VARCHAR(128),
    remark             VARCHAR(500),
    created_by         BIGINT,
    created_at         TIMESTAMP,
    updated_by         BIGINT,
    updated_at         TIMESTAMP,
    deleted            INT          NOT NULL DEFAULT 0,
    version            INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_sys_event_subscription_code ON sys_event_subscription (subscription_code);
CREATE INDEX idx_sys_event_subscription_topic ON sys_event_subscription (topic_code);
CREATE INDEX idx_sys_event_subscription_system ON sys_event_subscription (subscriber_system);

-- ========== 事件消息（事件总线投递记录，T009） ==========

CREATE TABLE sys_event_message (
    id                BIGINT       NOT NULL,
    message_key       VARCHAR(96)  NOT NULL,
    topic_code        VARCHAR(64)  NOT NULL,
    subscription_code VARCHAR(64),
    biz_type          VARCHAR(64),
    biz_id            VARCHAR(64),
    payload           TEXT,
    message_status    VARCHAR(32)  NOT NULL DEFAULT 'PENDING',
    retry_count       INT          NOT NULL DEFAULT 0,
    max_retry         INT          NOT NULL DEFAULT 5,
    next_retry_at     TIMESTAMP,
    published_at      TIMESTAMP,
    delivered_at      TIMESTAMP,
    error_message     VARCHAR(1000),
    idempotent_key    VARCHAR(128),
    dead_letter       INT          NOT NULL DEFAULT 0,
    operator_name     VARCHAR(64),
    org_id            BIGINT,
    org_name          VARCHAR(128),
    remark            VARCHAR(500),
    created_by        BIGINT,
    created_at        TIMESTAMP,
    updated_by        BIGINT,
    updated_at        TIMESTAMP,
    deleted           INT          NOT NULL DEFAULT 0,
    version           INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_sys_event_message_key ON sys_event_message (message_key);
CREATE INDEX idx_sys_event_message_topic ON sys_event_message (topic_code);
CREATE INDEX idx_sys_event_message_status ON sys_event_message (message_status);
CREATE INDEX idx_sys_event_message_idem ON sys_event_message (idempotent_key);

-- ========== 死信队列（T009） ==========

CREATE TABLE sys_dead_letter (
    id               BIGINT       NOT NULL,
    letter_no        VARCHAR(64)  NOT NULL,
    message_key      VARCHAR(96)  NOT NULL,
    topic_code       VARCHAR(64),
    subscriber_system VARCHAR(32),
    payload          TEXT,
    fail_reason      VARCHAR(1000),
    retry_count      INT          NOT NULL DEFAULT 0,
    dead_status      VARCHAR(32)  NOT NULL DEFAULT 'PENDING',
    handler_name     VARCHAR(64),
    handled_at       TIMESTAMP,
    handle_result    VARCHAR(500),
    org_id           BIGINT,
    org_name         VARCHAR(128),
    remark           VARCHAR(500),
    created_by       BIGINT,
    created_at       TIMESTAMP,
    updated_by       BIGINT,
    updated_at       TIMESTAMP,
    deleted          INT          NOT NULL DEFAULT 0,
    version          INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_sys_dead_letter_no ON sys_dead_letter (letter_no);
CREATE INDEX idx_sys_dead_letter_message ON sys_dead_letter (message_key);
CREATE INDEX idx_sys_dead_letter_status ON sys_dead_letter (dead_status);

-- ========== 幂等记录（T009） ==========

CREATE TABLE sys_idempotent_record (
    id              BIGINT       NOT NULL,
    idempotent_key  VARCHAR(128) NOT NULL,
    biz_type        VARCHAR(64),
    biz_id          VARCHAR(64),
    request_hash    VARCHAR(128),
    result_code     INT,
    expire_at       TIMESTAMP,
    record_status   VARCHAR(32)  NOT NULL DEFAULT 'PROCESSING',
    operator_name   VARCHAR(64),
    org_id          BIGINT,
    org_name        VARCHAR(128),
    remark          VARCHAR(500),
    created_by      BIGINT,
    created_at      TIMESTAMP,
    updated_by      BIGINT,
    updated_at      TIMESTAMP,
    deleted         INT          NOT NULL DEFAULT 0,
    version         INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_sys_idempotent_record_key ON sys_idempotent_record (idempotent_key);
CREATE INDEX idx_sys_idempotent_record_biz ON sys_idempotent_record (biz_type, biz_id);

-- ========== 集成监控（T009） ==========

CREATE TABLE sys_integration_monitor (
    id             BIGINT       NOT NULL,
    monitor_no     VARCHAR(64)  NOT NULL,
    monitor_day    VARCHAR(16)  NOT NULL,
    stat_hour      INT          NOT NULL DEFAULT 0,
    system_code    VARCHAR(32)  NOT NULL,
    target_type    VARCHAR(32)  NOT NULL DEFAULT 'API',
    target_code    VARCHAR(64),
    target_name    VARCHAR(200),
    total_count    INT          NOT NULL DEFAULT 0,
    success_count  INT          NOT NULL DEFAULT 0,
    fail_count     INT          NOT NULL DEFAULT 0,
    avg_cost_ms    INT          NOT NULL DEFAULT 0,
    max_cost_ms    INT          NOT NULL DEFAULT 0,
    health_status  VARCHAR(32)  NOT NULL DEFAULT 'HEALTHY',
    alert_flag     INT          NOT NULL DEFAULT 0,
    alert_message  VARCHAR(500),
    org_id         BIGINT,
    org_name       VARCHAR(128),
    remark         VARCHAR(500),
    created_by     BIGINT,
    created_at     TIMESTAMP,
    updated_by     BIGINT,
    updated_at     TIMESTAMP,
    deleted        INT          NOT NULL DEFAULT 0,
    version        INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_sys_integration_monitor_no ON sys_integration_monitor (monitor_no);
CREATE INDEX idx_sys_integration_monitor_day ON sys_integration_monitor (monitor_day);
CREATE INDEX idx_sys_integration_monitor_system ON sys_integration_monitor (system_code);
CREATE INDEX idx_sys_integration_monitor_health ON sys_integration_monitor (health_status);
