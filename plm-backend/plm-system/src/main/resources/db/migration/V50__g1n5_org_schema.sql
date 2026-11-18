-- G1-N5 公共平台底座—多组织多工厂（对应总任务书 WBS T100，公共能力，服务 G1-G8 全部系统）：
-- 组织、法人、工厂、部门、仓库、产线维度隔离与跨组织授权。
-- 说明：SQL 同时兼容 PostgreSQL 与 H2（PostgreSQL 兼容模式），主键由应用侧雪花算法生成。
-- 设计原则：
--   1) 法人、工厂、仓库、产线四级实体分层登记：法人（legal）承载财务与税务主体，
--      工厂（factory）承载生产与计划主体，仓库（warehouse）承载实物库存主体，
--      产线（line）承载生产执行主体；部门与组织人员沿用既有 sys_organization。
--   2) 维度隔离：各业务单据必须挂载法人/工厂/仓库/产线等维度，实现按维度隔离与汇总；
--      维度编码全局唯一，跨系统引用只认编码，避免各系统自造工厂编号。
--   3) 跨组织授权：当用户需要访问非本组织维度数据时，通过授权关系显式放开，
--      按授权类型（法人/工厂/仓库/产线/组织）与作用范围登记，支持有效期与撤销；
--      未授权一律按默认数据权限范围（sys_role.data_scope）与 org_id 过滤。
--   4) 与 T101 多币种多税率的衔接：法人主体登记本位币（base_currency），
--      业务币种与汇率、税率由 T101 模块统一维护。
-- 注意：
--   a) 业务字段一律不得命名为 version，避免与 BaseEntity 的乐观锁字段 version 冲突。
--   b) 各表主编码（legal_code/factory_code/warehouse_code/line_code/grant_no）支持人工指定，
--      且表上存在硬唯一索引；为与唯一索引保持一致，本模块删除语义为「释放编码」，
--      由服务层执行物理删除（与 G1-N1 及其后各节点同一处理方式）。

-- ========== 法人主体（T100） ==========

CREATE TABLE sys_legal_entity (
    id                  BIGINT       NOT NULL,
    legal_code          VARCHAR(64)  NOT NULL,
    legal_name          VARCHAR(200) NOT NULL,
    unified_social_code VARCHAR(64),
    tax_no              VARCHAR(64),
    legal_rep           VARCHAR(64),
    base_currency       VARCHAR(8),
    country             VARCHAR(64),
    region              VARCHAR(64),
    address             VARCHAR(255),
    contact_phone       VARCHAR(32),
    legal_status        VARCHAR(32)  NOT NULL DEFAULT 'ACTIVE',
    org_id              BIGINT,
    org_name            VARCHAR(128),
    description         VARCHAR(1000),
    remark              VARCHAR(500),
    created_by          BIGINT,
    created_at          TIMESTAMP,
    updated_by          BIGINT,
    updated_at          TIMESTAMP,
    deleted             INT          NOT NULL DEFAULT 0,
    version             INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_sys_legal_entity_code ON sys_legal_entity (legal_code);
CREATE INDEX idx_sys_legal_entity_status ON sys_legal_entity (legal_status);

-- ========== 工厂（T100） ==========

CREATE TABLE sys_factory (
    id            BIGINT       NOT NULL,
    factory_code  VARCHAR(64)  NOT NULL,
    factory_name  VARCHAR(200) NOT NULL,
    legal_code    VARCHAR(64),
    org_id        BIGINT,
    org_name      VARCHAR(128),
    factory_type  VARCHAR(32)  NOT NULL DEFAULT 'MANUFACTURE',
    country       VARCHAR(64),
    region        VARCHAR(64),
    address       VARCHAR(255),
    timezone      VARCHAR(64),
    manager       VARCHAR(64),
    factory_status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    description   VARCHAR(1000),
    remark        VARCHAR(500),
    created_by    BIGINT,
    created_at    TIMESTAMP,
    updated_by    BIGINT,
    updated_at    TIMESTAMP,
    deleted       INT          NOT NULL DEFAULT 0,
    version       INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_sys_factory_code ON sys_factory (factory_code);
CREATE INDEX idx_sys_factory_legal ON sys_factory (legal_code);
CREATE INDEX idx_sys_factory_status ON sys_factory (factory_status);

-- ========== 仓库（T100） ==========

CREATE TABLE sys_warehouse (
    id               BIGINT       NOT NULL,
    warehouse_code   VARCHAR(64)  NOT NULL,
    warehouse_name   VARCHAR(200) NOT NULL,
    factory_code     VARCHAR(64),
    org_id           BIGINT,
    org_name         VARCHAR(128),
    warehouse_type   VARCHAR(32)  NOT NULL DEFAULT 'RAW',
    location         VARCHAR(255),
    capacity         BIGINT       NOT NULL DEFAULT 0,
    manager          VARCHAR(64),
    warehouse_status VARCHAR(32)  NOT NULL DEFAULT 'ACTIVE',
    description      VARCHAR(1000),
    remark           VARCHAR(500),
    created_by       BIGINT,
    created_at       TIMESTAMP,
    updated_by       BIGINT,
    updated_at       TIMESTAMP,
    deleted          INT          NOT NULL DEFAULT 0,
    version          INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_sys_warehouse_code ON sys_warehouse (warehouse_code);
CREATE INDEX idx_sys_warehouse_factory ON sys_warehouse (factory_code);
CREATE INDEX idx_sys_warehouse_status ON sys_warehouse (warehouse_status);

-- ========== 产线（T100） ==========

CREATE TABLE sys_production_line (
    id                BIGINT       NOT NULL,
    line_code         VARCHAR(64)  NOT NULL,
    line_name         VARCHAR(200) NOT NULL,
    factory_code      VARCHAR(64),
    workshop          VARCHAR(128),
    line_type         VARCHAR(32)  NOT NULL DEFAULT 'ASSEMBLY',
    capacity_per_hour INT          NOT NULL DEFAULT 0,
    manager           VARCHAR(64),
    line_status       VARCHAR(32)  NOT NULL DEFAULT 'ACTIVE',
    org_id            BIGINT,
    org_name          VARCHAR(128),
    description       VARCHAR(1000),
    remark            VARCHAR(500),
    created_by        BIGINT,
    created_at        TIMESTAMP,
    updated_by        BIGINT,
    updated_at        TIMESTAMP,
    deleted           INT          NOT NULL DEFAULT 0,
    version           INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_sys_production_line_code ON sys_production_line (line_code);
CREATE INDEX idx_sys_production_line_factory ON sys_production_line (factory_code);
CREATE INDEX idx_sys_production_line_status ON sys_production_line (line_status);

-- ========== 跨组织授权（T100） ==========

CREATE TABLE sys_org_grant (
    id            BIGINT       NOT NULL,
    grant_no      VARCHAR(64)  NOT NULL,
    grant_type    VARCHAR(32)  NOT NULL DEFAULT 'FACTORY',
    grantor_code  VARCHAR(64),
    grantee_org_id BIGINT,
    grantee_name  VARCHAR(128),
    scope_type    VARCHAR(32)  NOT NULL DEFAULT 'ALL',
    scope_value   VARCHAR(255),
    effective_date TIMESTAMP,
    expire_date   TIMESTAMP,
    grant_status  VARCHAR(32)  NOT NULL DEFAULT 'ACTIVE',
    grant_reason  VARCHAR(1000),
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
CREATE UNIQUE INDEX uk_sys_org_grant_no ON sys_org_grant (grant_no);
CREATE INDEX idx_sys_org_grant_grantee ON sys_org_grant (grantee_org_id);
CREATE INDEX idx_sys_org_grant_status ON sys_org_grant (grant_status);
