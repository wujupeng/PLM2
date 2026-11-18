-- N1 统一平台基础能力：身份、组织、权限、字典、配置项、审计
-- 说明：SQL 同时兼容 PostgreSQL 与 H2（PostgreSQL 兼容模式），主键由应用侧雪花算法生成。

CREATE TABLE sys_organization (
    id          BIGINT       NOT NULL,
    org_code    VARCHAR(64)  NOT NULL,
    org_name    VARCHAR(128) NOT NULL,
    parent_id   BIGINT       NOT NULL DEFAULT 0,
    org_type    VARCHAR(32)  NOT NULL DEFAULT 'department',
    sort_no     INT          NOT NULL DEFAULT 0,
    status      INT          NOT NULL DEFAULT 1,
    remark      VARCHAR(255),
    created_by  BIGINT,
    created_at  TIMESTAMP,
    updated_by  BIGINT,
    updated_at  TIMESTAMP,
    deleted     INT          NOT NULL DEFAULT 0,
    version     INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_sys_organization_code ON sys_organization (org_code);
CREATE INDEX idx_sys_organization_parent ON sys_organization (parent_id);

CREATE TABLE sys_user (
    id            BIGINT       NOT NULL,
    username      VARCHAR(64)  NOT NULL,
    password      VARCHAR(128) NOT NULL,
    display_name  VARCHAR(64)  NOT NULL,
    email         VARCHAR(128),
    phone         VARCHAR(32),
    org_id        BIGINT,
    status        INT          NOT NULL DEFAULT 1,
    last_login_at TIMESTAMP,
    remark        VARCHAR(255),
    created_by    BIGINT,
    created_at    TIMESTAMP,
    updated_by    BIGINT,
    updated_at    TIMESTAMP,
    deleted       INT          NOT NULL DEFAULT 0,
    version       INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_sys_user_username ON sys_user (username);
CREATE INDEX idx_sys_user_org ON sys_user (org_id);

CREATE TABLE sys_role (
    id          BIGINT       NOT NULL,
    role_code   VARCHAR(64)  NOT NULL,
    role_name   VARCHAR(128) NOT NULL,
    data_scope  VARCHAR(32)  NOT NULL DEFAULT 'org',
    status      INT          NOT NULL DEFAULT 1,
    remark      VARCHAR(255),
    created_by  BIGINT,
    created_at  TIMESTAMP,
    updated_by  BIGINT,
    updated_at  TIMESTAMP,
    deleted     INT          NOT NULL DEFAULT 0,
    version     INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_sys_role_code ON sys_role (role_code);

CREATE TABLE sys_permission (
    id              BIGINT       NOT NULL,
    permission_code VARCHAR(128) NOT NULL,
    permission_name VARCHAR(128) NOT NULL,
    permission_type VARCHAR(16)  NOT NULL DEFAULT 'menu',
    parent_id       BIGINT       NOT NULL DEFAULT 0,
    path            VARCHAR(255),
    icon            VARCHAR(64),
    sort_no         INT          NOT NULL DEFAULT 0,
    status          INT          NOT NULL DEFAULT 1,
    remark          VARCHAR(255),
    created_by      BIGINT,
    created_at      TIMESTAMP,
    updated_by      BIGINT,
    updated_at      TIMESTAMP,
    deleted         INT          NOT NULL DEFAULT 0,
    version         INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_sys_permission_code ON sys_permission (permission_code);
CREATE INDEX idx_sys_permission_parent ON sys_permission (parent_id);

CREATE TABLE sys_user_role (
    id         BIGINT NOT NULL,
    user_id    BIGINT NOT NULL,
    role_id    BIGINT NOT NULL,
    created_by BIGINT,
    created_at TIMESTAMP,
    updated_by BIGINT,
    updated_at TIMESTAMP,
    deleted    INT    NOT NULL DEFAULT 0,
    version    INT    NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_sys_user_role ON sys_user_role (user_id, role_id);
CREATE INDEX idx_sys_user_role_role ON sys_user_role (role_id);

CREATE TABLE sys_role_permission (
    id            BIGINT NOT NULL,
    role_id       BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    created_by    BIGINT,
    created_at    TIMESTAMP,
    updated_by    BIGINT,
    updated_at    TIMESTAMP,
    deleted       INT    NOT NULL DEFAULT 0,
    version       INT    NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_sys_role_permission ON sys_role_permission (role_id, permission_id);
CREATE INDEX idx_sys_role_permission_permission ON sys_role_permission (permission_id);

CREATE TABLE sys_dictionary (
    id          BIGINT       NOT NULL,
    dict_type   VARCHAR(64)  NOT NULL,
    dict_label  VARCHAR(128) NOT NULL,
    dict_value  VARCHAR(128) NOT NULL,
    sort_no     INT          NOT NULL DEFAULT 0,
    status      INT          NOT NULL DEFAULT 1,
    remark      VARCHAR(255),
    created_by  BIGINT,
    created_at  TIMESTAMP,
    updated_by  BIGINT,
    updated_at  TIMESTAMP,
    deleted     INT          NOT NULL DEFAULT 0,
    version     INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_sys_dictionary ON sys_dictionary (dict_type, dict_value);

CREATE TABLE sys_config (
    id               BIGINT       NOT NULL,
    category         VARCHAR(64)  NOT NULL,
    config_key       VARCHAR(128) NOT NULL,
    config_name      VARCHAR(128) NOT NULL,
    config_value     VARCHAR(1000),
    pending_confirm  INT          NOT NULL DEFAULT 0,
    editable         INT          NOT NULL DEFAULT 1,
    remark           VARCHAR(500),
    created_by       BIGINT,
    created_at       TIMESTAMP,
    updated_by       BIGINT,
    updated_at       TIMESTAMP,
    deleted          INT          NOT NULL DEFAULT 0,
    version          INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_sys_config_key ON sys_config (config_key);
CREATE INDEX idx_sys_config_category ON sys_config (category);

CREATE TABLE sys_audit_log (
    id             BIGINT      NOT NULL,
    trace_id       VARCHAR(64),
    user_id        BIGINT,
    username       VARCHAR(64),
    module         VARCHAR(64),
    http_method    VARCHAR(16),
    uri            VARCHAR(255),
    ip             VARCHAR(64),
    request_params VARCHAR(2000),
    result_code    INT,
    success        INT,
    cost_ms        BIGINT,
    error_message  VARCHAR(500),
    created_by     BIGINT,
    created_at     TIMESTAMP,
    updated_by     BIGINT,
    updated_at     TIMESTAMP,
    deleted        INT         NOT NULL DEFAULT 0,
    version        INT         NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE INDEX idx_sys_audit_log_created ON sys_audit_log (created_at);
CREATE INDEX idx_sys_audit_log_trace ON sys_audit_log (trace_id);
