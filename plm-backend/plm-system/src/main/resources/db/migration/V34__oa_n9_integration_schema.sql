-- OA-N9 开放集成平台与 PLM/ERP/MES/EDI 协同：API 网关、Webhook、消息任务队列、连接器、主数据映射、EDI 通知、接口监控
-- 说明：SQL 同时兼容 PostgreSQL 与 H2（PostgreSQL 兼容模式），主键由应用侧雪花算法生成。
-- 设计原则：
--   1) 集成平台以"配置 + 记录"为核心：连接器/策略/订阅/凭证均为可配置数据，运行记录（访问审计、
--      投递记录、同步记录、消息任务、EDI 通知）用于监控、重试、回执、审计与补偿。
--   2) 权威数据边界遵循任务书要求，OA 不重复建设权威台账：
--      - 客户/供应商/物料/订单/采购/价格主数据权威归属 ERP（连接器仅做引用与映射）；
--      - 生产日报/生产顺序/工单状态权威归属 MES（OA 不重复维护 MES 实绩）；
--      - 检测委托/质量月报/供应商质量权威归属 QMS（OA 不替代权威质量记录）；
--      - EDI 报文原文与传输由 EDI 平台负责，OA 仅接收状态、异常告警与交付协同待办。
--      各连接器的权威源/同步方向/幂等与回执策略均为可配置项（sys_config）并标记待业务方确认。
--   3) 限流阈值、重试次数、死信阈值、凭证到期提醒天数、监控统计窗口等均为可配置项，不写死在代码中。
-- 注意：业务字段一律不得命名为 version，避免与 BaseEntity 的乐观锁字段 version 冲突。

-- ========== 统一 API 网关（OA-DEV-086） ==========

CREATE TABLE oa_api_policy (
    id                BIGINT       NOT NULL,
    policy_no         VARCHAR(64)  NOT NULL,
    policy_name       VARCHAR(200) NOT NULL,
    path_prefix       VARCHAR(255) NOT NULL,
    upstream          VARCHAR(255),
    http_methods      VARCHAR(64),
    auth_type         VARCHAR(32)  NOT NULL DEFAULT 'JWT',
    rate_limit_qps    INT,
    signature_flag    INT          NOT NULL DEFAULT 0,
    api_version       VARCHAR(32)  NOT NULL DEFAULT 'v1',
    ip_allow_list     VARCHAR(1000),
    ip_deny_list      VARCHAR(1000),
    audit_flag        INT          NOT NULL DEFAULT 1,
    status            INT          NOT NULL DEFAULT 1,
    org_id            BIGINT,
    org_name          VARCHAR(128),
    remark            VARCHAR(255),
    created_by        BIGINT,
    created_at        TIMESTAMP,
    updated_by        BIGINT,
    updated_at        TIMESTAMP,
    deleted           INT          NOT NULL DEFAULT 0,
    version           INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_oa_api_policy_no ON oa_api_policy (policy_no);
CREATE INDEX idx_oa_api_policy_prefix ON oa_api_policy (path_prefix);

CREATE TABLE oa_api_credential (
    id                BIGINT       NOT NULL,
    credential_no     VARCHAR(64)  NOT NULL,
    credential_name   VARCHAR(200) NOT NULL,
    app_key           VARCHAR(128) NOT NULL,
    app_secret        VARCHAR(255),
    owner_system      VARCHAR(32),
    expire_date       DATE,
    status            INT          NOT NULL DEFAULT 1,
    alert_flag        INT          NOT NULL DEFAULT 0,
    last_used_time    TIMESTAMP,
    org_id            BIGINT,
    org_name          VARCHAR(128),
    remark            VARCHAR(255),
    created_by        BIGINT,
    created_at        TIMESTAMP,
    updated_by        BIGINT,
    updated_at        TIMESTAMP,
    deleted           INT          NOT NULL DEFAULT 0,
    version           INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_oa_api_credential_no ON oa_api_credential (credential_no);
CREATE UNIQUE INDEX uk_oa_api_credential_key ON oa_api_credential (app_key);
CREATE INDEX idx_oa_api_credential_expire ON oa_api_credential (expire_date);

CREATE TABLE oa_api_access_log (
    id                BIGINT       NOT NULL,
    trace_id          VARCHAR(64),
    path              VARCHAR(255),
    http_method       VARCHAR(16),
    client_system     VARCHAR(32),
    app_key           VARCHAR(128),
    operator_user_id  BIGINT,
    operator_name     VARCHAR(64),
    ip_address        VARCHAR(64),
    status_code       INT,
    result_code       VARCHAR(32),
    cost_ms           INT,
    request_summary   VARCHAR(1000),
    error_msg         VARCHAR(1000),
    access_time       TIMESTAMP,
    org_id            BIGINT,
    org_name          VARCHAR(128),
    remark            VARCHAR(255),
    created_by        BIGINT,
    created_at        TIMESTAMP,
    updated_by        BIGINT,
    updated_at        TIMESTAMP,
    deleted           INT          NOT NULL DEFAULT 0,
    version           INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE INDEX idx_oa_api_access_trace ON oa_api_access_log (trace_id);
CREATE INDEX idx_oa_api_access_time ON oa_api_access_log (access_time);
CREATE INDEX idx_oa_api_access_client ON oa_api_access_log (client_system);

-- ========== Webhook 事件订阅（OA-DEV-087） ==========

CREATE TABLE oa_webhook_subscription (
    id                    BIGINT       NOT NULL,
    subscription_no       VARCHAR(64)  NOT NULL,
    subscription_name     VARCHAR(200) NOT NULL,
    event_type            VARCHAR(64)  NOT NULL,
    callback_url          VARCHAR(500) NOT NULL,
    secret                VARCHAR(128),
    owner_system          VARCHAR(32),
    max_retry             INT          NOT NULL DEFAULT 3,
    status                INT          NOT NULL DEFAULT 1,
    last_delivery_time    TIMESTAMP,
    last_delivery_status  VARCHAR(32),
    org_id                BIGINT,
    org_name              VARCHAR(128),
    remark                VARCHAR(255),
    created_by            BIGINT,
    created_at            TIMESTAMP,
    updated_by            BIGINT,
    updated_at            TIMESTAMP,
    deleted               INT          NOT NULL DEFAULT 0,
    version               INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_oa_webhook_sub_no ON oa_webhook_subscription (subscription_no);
CREATE INDEX idx_oa_webhook_sub_event ON oa_webhook_subscription (event_type);

CREATE TABLE oa_webhook_delivery (
    id                BIGINT       NOT NULL,
    subscription_id   BIGINT       NOT NULL,
    subscription_no   VARCHAR(64),
    event_type        VARCHAR(64),
    event_id          VARCHAR(64),
    payload           TEXT,
    delivery_status   VARCHAR(32)  NOT NULL DEFAULT 'PENDING',
    attempt_count     INT          NOT NULL DEFAULT 0,
    max_retry         INT          NOT NULL DEFAULT 3,
    response_code     INT,
    last_error        VARCHAR(1000),
    next_retry_time   TIMESTAMP,
    dead_flag         INT          NOT NULL DEFAULT 0,
    receipt_no        VARCHAR(64),
    delivery_time     TIMESTAMP,
    org_id            BIGINT,
    org_name          VARCHAR(128),
    remark            VARCHAR(255),
    created_by        BIGINT,
    created_at        TIMESTAMP,
    updated_by        BIGINT,
    updated_at        TIMESTAMP,
    deleted           INT          NOT NULL DEFAULT 0,
    version           INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE INDEX idx_oa_webhook_delivery_sub ON oa_webhook_delivery (subscription_id);
CREATE INDEX idx_oa_webhook_delivery_status ON oa_webhook_delivery (delivery_status);
CREATE INDEX idx_oa_webhook_delivery_dead ON oa_webhook_delivery (dead_flag);

-- ========== 消息总线与任务队列（OA-DEV-088） ==========

CREATE TABLE oa_message_task (
    id                BIGINT       NOT NULL,
    task_no           VARCHAR(64)  NOT NULL,
    task_type         VARCHAR(32)  NOT NULL DEFAULT 'NOTIFY',
    biz_key           VARCHAR(128),
    idempotent_key     VARCHAR(128),
    payload           TEXT,
    task_status       VARCHAR(32)  NOT NULL DEFAULT 'PENDING',
    priority          INT          NOT NULL DEFAULT 5,
    attempt_count     INT          NOT NULL DEFAULT 0,
    max_retry         INT          NOT NULL DEFAULT 3,
    last_error        VARCHAR(1000),
    next_execute_time TIMESTAMP,
    start_time        TIMESTAMP,
    finish_time       TIMESTAMP,
    dead_flag         INT          NOT NULL DEFAULT 0,
    org_id            BIGINT,
    org_name          VARCHAR(128),
    remark            VARCHAR(255),
    created_by        BIGINT,
    created_at        TIMESTAMP,
    updated_by        BIGINT,
    updated_at        TIMESTAMP,
    deleted           INT          NOT NULL DEFAULT 0,
    version           INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_oa_message_task_no ON oa_message_task (task_no);
CREATE UNIQUE INDEX uk_oa_message_task_idem ON oa_message_task (idempotent_key);
CREATE INDEX idx_oa_message_task_status ON oa_message_task (task_status);
CREATE INDEX idx_oa_message_task_type ON oa_message_task (task_type);

-- ========== 集成连接器（OA-DEV-089 ~ OA-DEV-093） ==========

CREATE TABLE oa_integration_connector (
    id                     BIGINT       NOT NULL,
    connector_no           VARCHAR(64)  NOT NULL,
    connector_name         VARCHAR(200) NOT NULL,
    system_code            VARCHAR(32)  NOT NULL,
    system_type            VARCHAR(32),
    base_url               VARCHAR(500),
    auth_type              VARCHAR(32)  NOT NULL DEFAULT 'OAUTH2',
    authority_system       VARCHAR(64),
    sync_direction         VARCHAR(32)  NOT NULL DEFAULT 'BIDIRECTIONAL',
    sso_flag               INT          NOT NULL DEFAULT 0,
    todo_sync_flag         INT          NOT NULL DEFAULT 0,
    master_data_scope      VARCHAR(500),
    credential_id          BIGINT,
    credential_expire_date DATE,
    last_sync_time         TIMESTAMP,
    status                 INT          NOT NULL DEFAULT 1,
    org_id                 BIGINT,
    org_name               VARCHAR(128),
    remark                 VARCHAR(255),
    created_by             BIGINT,
    created_at             TIMESTAMP,
    updated_by             BIGINT,
    updated_at             TIMESTAMP,
    deleted                INT          NOT NULL DEFAULT 0,
    version                INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_oa_connector_no ON oa_integration_connector (connector_no);
CREATE INDEX idx_oa_connector_system ON oa_integration_connector (system_code);

CREATE TABLE oa_connector_sync_log (
    id                BIGINT       NOT NULL,
    connector_id      BIGINT,
    connector_no      VARCHAR(64),
    system_code       VARCHAR(32),
    object_type       VARCHAR(64),
    direction         VARCHAR(32)  NOT NULL DEFAULT 'INBOUND',
    source_flag       VARCHAR(64),
    data_timestamp    TIMESTAMP,
    record_count      INT          NOT NULL DEFAULT 0,
    sync_status       VARCHAR(32)  NOT NULL DEFAULT 'SUCCESS',
    receipt_no        VARCHAR(64),
    receipt_status    VARCHAR(32),
    cost_ms           INT,
    error_msg         VARCHAR(1000),
    operator_user_id  BIGINT,
    operator_name     VARCHAR(64),
    sync_time         TIMESTAMP,
    org_id            BIGINT,
    org_name          VARCHAR(128),
    remark            VARCHAR(255),
    created_by        BIGINT,
    created_at        TIMESTAMP,
    updated_by        BIGINT,
    updated_at        TIMESTAMP,
    deleted           INT          NOT NULL DEFAULT 0,
    version           INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE INDEX idx_oa_sync_log_connector ON oa_connector_sync_log (connector_id);
CREATE INDEX idx_oa_sync_log_system ON oa_connector_sync_log (system_code);
CREATE INDEX idx_oa_sync_log_time ON oa_connector_sync_log (sync_time);
CREATE INDEX idx_oa_sync_log_status ON oa_connector_sync_log (sync_status);

-- ========== 主数据映射（OA-DEV-090） ==========

CREATE TABLE oa_master_data_mapping (
    id                BIGINT       NOT NULL,
    mapping_no        VARCHAR(64)  NOT NULL,
    object_type       VARCHAR(64)  NOT NULL,
    local_code        VARCHAR(128) NOT NULL,
    external_code     VARCHAR(128) NOT NULL,
    authority_system  VARCHAR(64),
    source_system     VARCHAR(32),
    sync_direction    VARCHAR(32)  NOT NULL DEFAULT 'INBOUND',
    status            INT          NOT NULL DEFAULT 1,
    last_sync_time    TIMESTAMP,
    org_id            BIGINT,
    org_name          VARCHAR(128),
    remark            VARCHAR(255),
    created_by        BIGINT,
    created_at        TIMESTAMP,
    updated_by        BIGINT,
    updated_at        TIMESTAMP,
    deleted           INT          NOT NULL DEFAULT 0,
    version           INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_oa_mapping_no ON oa_master_data_mapping (mapping_no);
CREATE INDEX idx_oa_mapping_object ON oa_master_data_mapping (object_type);
CREATE INDEX idx_oa_mapping_local ON oa_master_data_mapping (local_code);

-- ========== EDI 状态通知（OA-DEV-093） ==========

CREATE TABLE oa_edi_notice (
    id                BIGINT       NOT NULL,
    notice_no         VARCHAR(64)  NOT NULL,
    message_id        VARCHAR(128) NOT NULL,
    partner_code      VARCHAR(64),
    partner_name      VARCHAR(200),
    order_no          VARCHAR(128),
    notice_type       VARCHAR(32)  NOT NULL DEFAULT 'STATUS',
    notice_status     VARCHAR(64),
    alert_flag        INT          NOT NULL DEFAULT 0,
    todo_flag         INT          NOT NULL DEFAULT 0,
    todo_id           BIGINT,
    received_time     TIMESTAMP,
    handle_user_id    BIGINT,
    handle_user_name  VARCHAR(64),
    handle_status     VARCHAR(32)  NOT NULL DEFAULT 'PENDING',
    handle_remark     VARCHAR(500),
    org_id            BIGINT,
    org_name          VARCHAR(128),
    remark            VARCHAR(255),
    created_by        BIGINT,
    created_at        TIMESTAMP,
    updated_by        BIGINT,
    updated_at        TIMESTAMP,
    deleted           INT          NOT NULL DEFAULT 0,
    version           INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_oa_edi_notice_no ON oa_edi_notice (notice_no);
CREATE INDEX idx_oa_edi_notice_msg ON oa_edi_notice (message_id);
CREATE INDEX idx_oa_edi_notice_order ON oa_edi_notice (order_no);
CREATE INDEX idx_oa_edi_notice_status ON oa_edi_notice (handle_status);
