-- OA-N2 统一门户与身份组织权限：岗位、员工任职档案、流程代理授权、应用注册中心、应用授权、SSO 客户端
-- 说明：SQL 同时兼容 PostgreSQL 与 H2（PostgreSQL 兼容模式），主键由应用侧雪花算法生成。
-- 与既有 sys_organization / sys_user / sys_role / sys_permission / sys_dictionary / sys_config / sys_audit_log 复用，不重复建设。

-- ========== 岗位 ==========

CREATE TABLE sys_position (
    id            BIGINT       NOT NULL,
    position_code VARCHAR(64)  NOT NULL,
    position_name VARCHAR(128) NOT NULL,
    org_id        BIGINT,
    position_level VARCHAR(32)  NOT NULL DEFAULT 'STAFF',
    sort_no       INT          NOT NULL DEFAULT 0,
    status        INT          NOT NULL DEFAULT 1,
    remark        VARCHAR(255),
    created_by    BIGINT,
    created_at    TIMESTAMP,
    updated_by    BIGINT,
    updated_at    TIMESTAMP,
    deleted       INT          NOT NULL DEFAULT 0,
    version       INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_sys_position_code ON sys_position (position_code);
CREATE INDEX idx_sys_position_org ON sys_position (org_id);

-- ========== 员工任职档案 ==========

CREATE TABLE sys_employment (
    id                BIGINT       NOT NULL,
    employee_no       VARCHAR(64)  NOT NULL,
    user_id           BIGINT,
    employee_name     VARCHAR(64)  NOT NULL,
    org_id            BIGINT,
    position_id       BIGINT,
    position_name     VARCHAR(128),
    employment_type   VARCHAR(32)  NOT NULL DEFAULT 'FULL_TIME',
    employment_status VARCHAR(32)  NOT NULL DEFAULT 'ACTIVE',
    hire_date         DATE,
    leave_date        DATE,
    manager_user_id   BIGINT,
    work_location     VARCHAR(128),
    remark            VARCHAR(255),
    created_by        BIGINT,
    created_at        TIMESTAMP,
    updated_by        BIGINT,
    updated_at        TIMESTAMP,
    deleted           INT          NOT NULL DEFAULT 0,
    version           INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_sys_employment_no ON sys_employment (employee_no);
CREATE INDEX idx_sys_employment_user ON sys_employment (user_id);
CREATE INDEX idx_sys_employment_org ON sys_employment (org_id);

-- ========== 流程代理授权 ==========

CREATE TABLE sys_delegation (
    id               BIGINT       NOT NULL,
    delegation_no    VARCHAR(64)  NOT NULL,
    delegator_user_id BIGINT      NOT NULL,
    delegator_name   VARCHAR(64),
    delegate_user_id BIGINT       NOT NULL,
    delegate_name    VARCHAR(64),
    apply_scope      VARCHAR(32)  NOT NULL DEFAULT 'ALL',
    process_code     VARCHAR(128),
    start_at         TIMESTAMP,
    end_at           TIMESTAMP,
    delegation_status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    reason           VARCHAR(500),
    remark           VARCHAR(255),
    created_by       BIGINT,
    created_at       TIMESTAMP,
    updated_by       BIGINT,
    updated_at       TIMESTAMP,
    deleted          INT          NOT NULL DEFAULT 0,
    version          INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_sys_delegation_no ON sys_delegation (delegation_no);
CREATE INDEX idx_sys_delegation_delegator ON sys_delegation (delegator_user_id);
CREATE INDEX idx_sys_delegation_delegate ON sys_delegation (delegate_user_id);

-- ========== 应用注册中心 ==========

CREATE TABLE sys_application (
    id            BIGINT       NOT NULL,
    app_code      VARCHAR(64)  NOT NULL,
    app_name      VARCHAR(128) NOT NULL,
    app_type      VARCHAR(32)  NOT NULL DEFAULT 'INTERNAL',
    entry_url     VARCHAR(255),
    icon          VARCHAR(64),
    app_category  VARCHAR(64),
    visible_scope VARCHAR(32)  NOT NULL DEFAULT 'ALL',
    sso_enabled   INT          NOT NULL DEFAULT 0,
    sort_no       INT          NOT NULL DEFAULT 0,
    status        VARCHAR(32)  NOT NULL DEFAULT 'enabled',
    owner         VARCHAR(64),
    description   VARCHAR(500),
    remark        VARCHAR(255),
    created_by    BIGINT,
    created_at    TIMESTAMP,
    updated_by    BIGINT,
    updated_at    TIMESTAMP,
    deleted       INT          NOT NULL DEFAULT 0,
    version       INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_sys_application_code ON sys_application (app_code);

CREATE TABLE sys_application_role (
    id             BIGINT NOT NULL,
    application_id BIGINT NOT NULL,
    role_id        BIGINT NOT NULL,
    created_by     BIGINT,
    created_at     TIMESTAMP,
    updated_by     BIGINT,
    updated_at     TIMESTAMP,
    deleted        INT    NOT NULL DEFAULT 0,
    version        INT    NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
-- 说明：应用授权采用逻辑删除后重建的方式，故使用普通索引而非唯一索引，避免逻辑删除残留行与唯一约束冲突。
CREATE INDEX idx_sys_application_role ON sys_application_role (application_id, role_id);

-- ========== SSO 客户端 ==========

CREATE TABLE sys_sso_client (
    id                BIGINT       NOT NULL,
    client_id         VARCHAR(128) NOT NULL,
    client_secret     VARCHAR(128) NOT NULL,
    client_name       VARCHAR(128) NOT NULL,
    redirect_uri      VARCHAR(500),
    grant_types       VARCHAR(128) NOT NULL DEFAULT 'client_credentials',
    scopes            VARCHAR(255),
    token_ttl_seconds INT          NOT NULL DEFAULT 3600,
    status            VARCHAR(32)  NOT NULL DEFAULT 'enabled',
    remark            VARCHAR(255),
    created_by        BIGINT,
    created_at        TIMESTAMP,
    updated_by        BIGINT,
    updated_at        TIMESTAMP,
    deleted           INT          NOT NULL DEFAULT 0,
    version           INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_sys_sso_client_id ON sys_sso_client (client_id);
