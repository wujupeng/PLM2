-- G1-N8 公共平台底座—主数据平台（对应总任务书 WBS T007 主数据平台，属公共平台 G1）。
-- 说明：SQL 同时兼容 PostgreSQL 与 H2（PostgreSQL 兼容模式），主键由应用侧雪花算法生成。
-- 设计原则：
--   1) 主数据域（sys_mdm_domain）：登记物料、产品、客户、供应商、组织、人员、仓库、工艺、设备
--      等主数据域及其权威源系统（六系统不得各自维护主数据，PLM 为物料/产品/BOM 权威源）。
--   2) 权威源登记（sys_mdm_source）：登记每个域在各系统中的权威级别与同步方向，明确「单一事实来源」。
--   3) 编码标准（sys_mdm_code_standard）：登记各主数据域的编码规则与示例，统一跨系统编码口径。
--   4) 主数据分发（sys_mdm_distribution）：登记主数据向各目标系统的分发任务、状态与回执。
--   5) 变更申请（sys_mdm_change_request）：主数据新增/修改/停用/合并的申请与审批，保持变更可审计。
--   6) 质量校验（sys_mdm_quality_check）：主数据完整性/一致性/唯一性等校验结果与评分。
--   7) 同步日志（sys_mdm_sync_log）：主数据在各系统间同步的执行日志，支持异常定位。
--   8) 编码发放记录（sys_mdm_code_issue）：主数据编码的实际发放流水，支持编码回收与追溯。
-- 注意：
--   a) 业务字段一律不得命名为 version，避免与 BaseEntity 的乐观锁字段 version 冲突。
--   b) 各表主编码/唯一键存在硬唯一索引；为与唯一索引保持一致，本模块删除语义为「释放编码」，
--      由服务层执行物理删除（与 G1-N1 及其后各节点同一处理方式）。

-- ========== T007 主数据平台：主数据域 ==========

CREATE TABLE sys_mdm_domain (
    id              BIGINT        NOT NULL,
    domain_no       VARCHAR(64)   NOT NULL,
    domain_code     VARCHAR(64)   NOT NULL,
    domain_name     VARCHAR(200)  NOT NULL,
    master_type     VARCHAR(32)   NOT NULL DEFAULT 'MATERIAL',
    authority_system VARCHAR(32)  NOT NULL DEFAULT 'PLM',
    owner_dept      VARCHAR(128),
    sync_mode       VARCHAR(32)   NOT NULL DEFAULT 'PUSH',
    domain_status   VARCHAR(32)   NOT NULL DEFAULT 'ACTIVE',
    org_id          BIGINT,
    org_name        VARCHAR(128),
    description     VARCHAR(1000),
    remark          VARCHAR(500),
    created_by      BIGINT,
    created_at      TIMESTAMP,
    updated_by      BIGINT,
    updated_at      TIMESTAMP,
    deleted         INT           NOT NULL DEFAULT 0,
    version         INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_sys_mdm_domain_no ON sys_mdm_domain (domain_no);
CREATE UNIQUE INDEX uk_sys_mdm_domain_code ON sys_mdm_domain (domain_code);
CREATE INDEX idx_sys_mdm_domain_type ON sys_mdm_domain (master_type);

-- ========== T007 主数据平台：权威源登记 ==========

CREATE TABLE sys_mdm_source (
    id              BIGINT        NOT NULL,
    source_no       VARCHAR(64)   NOT NULL,
    domain_code     VARCHAR(64)   NOT NULL,
    source_system   VARCHAR(32)   NOT NULL,
    source_entity   VARCHAR(128),
    authority_level VARCHAR(32)   NOT NULL DEFAULT 'PRIMARY',
    sync_direction  VARCHAR(32)   NOT NULL DEFAULT 'OUT',
    source_status   VARCHAR(32)   NOT NULL DEFAULT 'ACTIVE',
    org_id          BIGINT,
    org_name        VARCHAR(128),
    description     VARCHAR(1000),
    remark          VARCHAR(500),
    created_by      BIGINT,
    created_at      TIMESTAMP,
    updated_by      BIGINT,
    updated_at      TIMESTAMP,
    deleted         INT           NOT NULL DEFAULT 0,
    version         INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_sys_mdm_source_no ON sys_mdm_source (source_no);
CREATE INDEX idx_sys_mdm_source_domain ON sys_mdm_source (domain_code);

-- ========== T007 主数据平台：编码标准 ==========

CREATE TABLE sys_mdm_code_standard (
    id              BIGINT        NOT NULL,
    standard_no     VARCHAR(64)   NOT NULL,
    domain_code     VARCHAR(64)   NOT NULL,
    standard_code   VARCHAR(64)   NOT NULL,
    standard_name   VARCHAR(200)  NOT NULL,
    code_pattern    VARCHAR(200),
    seq_length      INT           NOT NULL DEFAULT 4,
    reset_cycle     VARCHAR(32)   NOT NULL DEFAULT 'NONE',
    sample_value    VARCHAR(128),
    standard_status VARCHAR(32)   NOT NULL DEFAULT 'ACTIVE',
    org_id          BIGINT,
    org_name        VARCHAR(128),
    description     VARCHAR(1000),
    remark          VARCHAR(500),
    created_by      BIGINT,
    created_at      TIMESTAMP,
    updated_by      BIGINT,
    updated_at      TIMESTAMP,
    deleted         INT           NOT NULL DEFAULT 0,
    version         INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_sys_mdm_code_standard_no ON sys_mdm_code_standard (standard_no);
CREATE UNIQUE INDEX uk_sys_mdm_code_standard_code ON sys_mdm_code_standard (standard_code);
CREATE INDEX idx_sys_mdm_code_standard_domain ON sys_mdm_code_standard (domain_code);

-- ========== T007 主数据平台：主数据分发 ==========

CREATE TABLE sys_mdm_distribution (
    id              BIGINT        NOT NULL,
    dist_no         VARCHAR(64)   NOT NULL,
    domain_code     VARCHAR(64)   NOT NULL,
    master_code     VARCHAR(128),
    target_system   VARCHAR(32)   NOT NULL,
    dist_type       VARCHAR(32)   NOT NULL DEFAULT 'FULL',
    dist_status     VARCHAR(32)   NOT NULL DEFAULT 'PENDING',
    dist_time       TIMESTAMP,
    ack_time        TIMESTAMP,
    retry_count     INT           NOT NULL DEFAULT 0,
    message         VARCHAR(1000),
    org_id          BIGINT,
    org_name        VARCHAR(128),
    description     VARCHAR(1000),
    remark          VARCHAR(500),
    created_by      BIGINT,
    created_at      TIMESTAMP,
    updated_by      BIGINT,
    updated_at      TIMESTAMP,
    deleted         INT           NOT NULL DEFAULT 0,
    version         INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_sys_mdm_distribution_no ON sys_mdm_distribution (dist_no);
CREATE INDEX idx_sys_mdm_distribution_domain ON sys_mdm_distribution (domain_code);
CREATE INDEX idx_sys_mdm_distribution_status ON sys_mdm_distribution (dist_status);

-- ========== T007 主数据平台：主数据变更申请 ==========

CREATE TABLE sys_mdm_change_request (
    id              BIGINT        NOT NULL,
    change_no       VARCHAR(64)   NOT NULL,
    domain_code     VARCHAR(64)   NOT NULL,
    master_code     VARCHAR(128),
    change_type     VARCHAR(32)   NOT NULL DEFAULT 'UPDATE',
    before_value    VARCHAR(2000),
    after_value     VARCHAR(2000),
    change_reason   VARCHAR(1000),
    request_status  VARCHAR(32)   NOT NULL DEFAULT 'SUBMITTED',
    applicant_name  VARCHAR(128),
    approver_name   VARCHAR(128),
    apply_time      TIMESTAMP,
    approve_time    TIMESTAMP,
    org_id          BIGINT,
    org_name        VARCHAR(128),
    description     VARCHAR(1000),
    remark          VARCHAR(500),
    created_by      BIGINT,
    created_at      TIMESTAMP,
    updated_by      BIGINT,
    updated_at      TIMESTAMP,
    deleted         INT           NOT NULL DEFAULT 0,
    version         INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_sys_mdm_change_request_no ON sys_mdm_change_request (change_no);
CREATE INDEX idx_sys_mdm_change_request_domain ON sys_mdm_change_request (domain_code);
CREATE INDEX idx_sys_mdm_change_request_status ON sys_mdm_change_request (request_status);

-- ========== T007 主数据平台：主数据质量校验 ==========

CREATE TABLE sys_mdm_quality_check (
    id              BIGINT        NOT NULL,
    check_no        VARCHAR(64)   NOT NULL,
    domain_code     VARCHAR(64)   NOT NULL,
    master_code     VARCHAR(128),
    check_item      VARCHAR(128),
    check_result    VARCHAR(32)   NOT NULL DEFAULT 'PASS',
    score           INT           NOT NULL DEFAULT 100,
    message         VARCHAR(1000),
    check_time      TIMESTAMP,
    org_id          BIGINT,
    org_name        VARCHAR(128),
    description     VARCHAR(1000),
    remark          VARCHAR(500),
    created_by      BIGINT,
    created_at      TIMESTAMP,
    updated_by      BIGINT,
    updated_at      TIMESTAMP,
    deleted         INT           NOT NULL DEFAULT 0,
    version         INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_sys_mdm_quality_check_no ON sys_mdm_quality_check (check_no);
CREATE INDEX idx_sys_mdm_quality_check_domain ON sys_mdm_quality_check (domain_code);
CREATE INDEX idx_sys_mdm_quality_check_result ON sys_mdm_quality_check (check_result);

-- ========== T007 主数据平台：主数据同步日志 ==========

CREATE TABLE sys_mdm_sync_log (
    id              BIGINT        NOT NULL,
    log_no          VARCHAR(64)   NOT NULL,
    domain_code     VARCHAR(64)   NOT NULL,
    source_system   VARCHAR(32),
    target_system   VARCHAR(32),
    master_code     VARCHAR(128),
    sync_status     VARCHAR(32)   NOT NULL DEFAULT 'SUCCESS',
    sync_time       TIMESTAMP,
    message         VARCHAR(1000),
    org_id          BIGINT,
    org_name        VARCHAR(128),
    description     VARCHAR(1000),
    remark          VARCHAR(500),
    created_by      BIGINT,
    created_at      TIMESTAMP,
    updated_by      BIGINT,
    updated_at      TIMESTAMP,
    deleted         INT           NOT NULL DEFAULT 0,
    version         INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_sys_mdm_sync_log_no ON sys_mdm_sync_log (log_no);
CREATE INDEX idx_sys_mdm_sync_log_domain ON sys_mdm_sync_log (domain_code);
CREATE INDEX idx_sys_mdm_sync_log_status ON sys_mdm_sync_log (sync_status);

-- ========== T007 主数据平台：编码发放记录 ==========

CREATE TABLE sys_mdm_code_issue (
    id              BIGINT        NOT NULL,
    issue_no        VARCHAR(64)   NOT NULL,
    domain_code     VARCHAR(64)   NOT NULL,
    standard_code   VARCHAR(64),
    master_code     VARCHAR(128),
    seq_value       BIGINT,
    issue_time      TIMESTAMP,
    issued_by       VARCHAR(128),
    issue_status    VARCHAR(32)   NOT NULL DEFAULT 'ISSUED',
    org_id          BIGINT,
    org_name        VARCHAR(128),
    description     VARCHAR(1000),
    remark          VARCHAR(500),
    created_by      BIGINT,
    created_at      TIMESTAMP,
    updated_by      BIGINT,
    updated_at      TIMESTAMP,
    deleted         INT           NOT NULL DEFAULT 0,
    version         INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_sys_mdm_code_issue_no ON sys_mdm_code_issue (issue_no);
CREATE INDEX idx_sys_mdm_code_issue_domain ON sys_mdm_code_issue (domain_code);
CREATE INDEX idx_sys_mdm_code_issue_master ON sys_mdm_code_issue (master_code);
