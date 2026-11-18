-- G1-N4 公共平台底座—身份与权限增强（对应总任务书 WBS T006 统一身份 / T008 权限审计）：
-- T006：统一用户、组织、岗位、角色、单点登录、多因素认证和离职禁用；
-- T008：数据权限、字段权限、审批权限、职责分离、审计日志、敏感操作追踪。
-- 说明：SQL 同时兼容 PostgreSQL 与 H2（PostgreSQL 兼容模式），主键由应用侧雪花算法生成。
-- 设计原则：
--   1) 统一身份复用既有 sys_user/sys_organization/sys_role/sys_permission，本节点只补齐缺口：
--      单点登录（SSO 提供商注册）、多因素认证（MFA 绑定与校验留痕）、字段级权限、职责分离（SoD）。
--   2) 多因素认证：MFA 绑定与用户一对多（不同认证方式），绑定密钥加密存储（应用层负责加解密）；
--      每次校验登记留痕，登录与敏感操作均可要求二次认证。
--   3) 单点登录：按协议（SAML/OIDC/CAS）登记服务提供方参数，支持接入企业统一身份提供方，
--      本地账号与 SSO 账号并存，离职禁用沿用 sys_user.status。
--   4) 字段级权限：在角色/权限之外，按「业务模块 + 数据表 + 字段」配置可见性与脱敏级别，
--      支撑数据权限细化到列，避免列表接口整行返回导致敏感字段泄露。
--   5) 职责分离（SoD）：登记互斥角色/权限对（如「采购下单」与「付款审批」），
--      一旦同一用户同时命中互斥项即生成违规记录，供权限审计复核与整改。
--   6) 审计日志与敏感操作追踪复用既有 sys_audit_log，本节点补充 MFA 校验日志与 SoD 违规记录。
-- 注意：
--   a) 业务字段一律不得命名为 version，避免与 BaseEntity 的乐观锁字段 version 冲突；
--      协议版本使用 protocol_ver，密钥版本使用 key_ver。
--   b) 各表主编码（bind_no/log_no/provider_code/perm_no/rule_no/violation_no）支持人工指定，
--      且表上存在硬唯一索引；为与唯一索引保持一致，本模块删除语义为「释放编码」，
--      由服务层执行物理删除（与 G1-N1 幂等记录、G1-N2/G1-N3 同一处理方式）。

-- ========== 多因素认证绑定（T006） ==========

CREATE TABLE sys_mfa_binding (
    id             BIGINT       NOT NULL,
    bind_no        VARCHAR(64)  NOT NULL,
    user_id        BIGINT,
    username       VARCHAR(64),
    mfa_type       VARCHAR(32)  NOT NULL DEFAULT 'TOTP',
    secret_key     VARCHAR(255),
    key_ver        VARCHAR(32),
    contact_phone  VARCHAR(32),
    contact_email  VARCHAR(128),
    bind_status    VARCHAR(32)  NOT NULL DEFAULT 'PENDING',
    bind_time      TIMESTAMP,
    last_verify_at TIMESTAMP,
    verify_count   INT          NOT NULL DEFAULT 0,
    fail_count     INT          NOT NULL DEFAULT 0,
    expire_time    TIMESTAMP,
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
CREATE UNIQUE INDEX uk_sys_mfa_binding_no ON sys_mfa_binding (bind_no);
CREATE INDEX idx_sys_mfa_binding_user ON sys_mfa_binding (user_id);
CREATE INDEX idx_sys_mfa_binding_status ON sys_mfa_binding (bind_status);

-- ========== MFA 校验日志（T006 / 敏感操作追踪） ==========

CREATE TABLE sys_mfa_verify_log (
    id            BIGINT       NOT NULL,
    log_no        VARCHAR(64)  NOT NULL,
    user_id       BIGINT,
    username      VARCHAR(64),
    mfa_type      VARCHAR(32)  NOT NULL DEFAULT 'TOTP',
    verify_scene  VARCHAR(32)  NOT NULL DEFAULT 'LOGIN',
    verify_result VARCHAR(32)  NOT NULL DEFAULT 'SUCCESS',
    fail_reason   VARCHAR(255),
    client_ip     VARCHAR(64),
    verify_time   TIMESTAMP,
    cost_ms       INT          NOT NULL DEFAULT 0,
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
CREATE UNIQUE INDEX uk_sys_mfa_verify_log_no ON sys_mfa_verify_log (log_no);
CREATE INDEX idx_sys_mfa_verify_log_user ON sys_mfa_verify_log (user_id);
CREATE INDEX idx_sys_mfa_verify_log_result ON sys_mfa_verify_log (verify_result);

-- ========== 单点登录提供商（T006） ==========

CREATE TABLE sys_sso_provider (
    id             BIGINT       NOT NULL,
    provider_code  VARCHAR(64)  NOT NULL,
    provider_name  VARCHAR(128) NOT NULL,
    protocol       VARCHAR(32)  NOT NULL DEFAULT 'OIDC',
    protocol_ver   VARCHAR(32),
    issuer         VARCHAR(255),
    sso_url        VARCHAR(512),
    logout_url     VARCHAR(512),
    metadata_url   VARCHAR(512),
    client_id      VARCHAR(128),
    certificate_algo VARCHAR(32),
    provider_status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
    last_sync_at   TIMESTAMP,
    org_id         BIGINT,
    org_name       VARCHAR(128),
    description    VARCHAR(1000),
    remark         VARCHAR(500),
    created_by     BIGINT,
    created_at     TIMESTAMP,
    updated_by     BIGINT,
    updated_at     TIMESTAMP,
    deleted        INT          NOT NULL DEFAULT 0,
    version        INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_sys_sso_provider_code ON sys_sso_provider (provider_code);
CREATE INDEX idx_sys_sso_provider_status ON sys_sso_provider (provider_status);

-- ========== 字段级权限（T008） ==========

CREATE TABLE sys_field_permission (
    id           BIGINT       NOT NULL,
    perm_no      VARCHAR(64)  NOT NULL,
    role_code    VARCHAR(64)  NOT NULL,
    biz_module   VARCHAR(32),
    table_name   VARCHAR(128) NOT NULL,
    field_name   VARCHAR(128) NOT NULL,
    field_label  VARCHAR(128),
    access_level VARCHAR(32)  NOT NULL DEFAULT 'HIDDEN',
    mask_rule    VARCHAR(255),
    perm_status  VARCHAR(32)  NOT NULL DEFAULT 'ACTIVE',
    description  VARCHAR(1000),
    org_id       BIGINT,
    org_name     VARCHAR(128),
    remark       VARCHAR(500),
    created_by   BIGINT,
    created_at   TIMESTAMP,
    updated_by   BIGINT,
    updated_at   TIMESTAMP,
    deleted      INT          NOT NULL DEFAULT 0,
    version      INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_sys_field_permission_no ON sys_field_permission (perm_no);
CREATE INDEX idx_sys_field_permission_role ON sys_field_permission (role_code);
CREATE INDEX idx_sys_field_permission_table ON sys_field_permission (table_name, field_name);
CREATE INDEX idx_sys_field_permission_status ON sys_field_permission (perm_status);

-- ========== 职责分离规则（T008） ==========

CREATE TABLE sys_sod_rule (
    id              BIGINT       NOT NULL,
    rule_no         VARCHAR(64)  NOT NULL,
    rule_name       VARCHAR(200) NOT NULL,
    biz_module      VARCHAR(32),
    conflict_role_a VARCHAR(64),
    conflict_role_b VARCHAR(64),
    conflict_perm_a VARCHAR(128),
    conflict_perm_b VARCHAR(128),
    risk_level      VARCHAR(32)  NOT NULL DEFAULT 'MEDIUM',
    rule_status     VARCHAR(32)  NOT NULL DEFAULT 'ACTIVE',
    description     VARCHAR(1000),
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
CREATE UNIQUE INDEX uk_sys_sod_rule_no ON sys_sod_rule (rule_no);
CREATE INDEX idx_sys_sod_rule_module ON sys_sod_rule (biz_module);
CREATE INDEX idx_sys_sod_rule_status ON sys_sod_rule (rule_status);

-- ========== 职责分离违规记录（T008） ==========

CREATE TABLE sys_sod_violation (
    id              BIGINT       NOT NULL,
    violation_no    VARCHAR(64)  NOT NULL,
    rule_no         VARCHAR(64)  NOT NULL,
    rule_name       VARCHAR(200),
    user_id         BIGINT,
    username        VARCHAR(64),
    conflict_detail VARCHAR(1000),
    risk_level      VARCHAR(32)  NOT NULL DEFAULT 'MEDIUM',
    handle_status   VARCHAR(32)  NOT NULL DEFAULT 'OPEN',
    handler         VARCHAR(64),
    handle_time     TIMESTAMP,
    handle_note     VARCHAR(1000),
    detect_time     TIMESTAMP,
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
CREATE UNIQUE INDEX uk_sys_sod_violation_no ON sys_sod_violation (violation_no);
CREATE INDEX idx_sys_sod_violation_rule ON sys_sod_violation (rule_no);
CREATE INDEX idx_sys_sod_violation_status ON sys_sod_violation (handle_status);
CREATE INDEX idx_sys_sod_violation_user ON sys_sod_violation (user_id);
