-- G1-N7 公共平台底座—治理中心（对应总任务书 WBS T001 项目治理 / T002 现状盘点 /
-- T003 流程建模 / T004 需求追踪 / T005 总体架构，均属公共平台 G1）。
-- 说明：SQL 同时兼容 PostgreSQL 与 H2（PostgreSQL 兼容模式），主键由应用侧雪花算法生成。
-- 设计原则：
--   1) 项目治理（T001）：登记项目章程要点（范围/组织/沟通）、里程碑、治理任务与风险/问题/变更，
--      使项目范围、进度、交付与风险在同一台账中可追踪、可审计。
--   2) 现状盘点（T002）：登记现有 ERP/PLM/OA/MES/WMS/SRM 等系统的现状（厂商、部署、用户数、
--      迁移策略）与盘点发现（流程、数据、集成、人工、痛点），为替换与迁移提供基线。
--   3) 流程建模（T003）：按端到端流程（订单到收款 O2C/采购到付款 P2P/计划到生产 P2M/
--      收货到发运 R2S/设计到量产 D2M）建立流程与节点模型，节点登记类型、角色、系统域与输入输出物。
--   4) 需求追踪（T004）：建立「业务需求-功能-数据/API-测试用例-验收证据」追踪矩阵，
--      以需求为主键、以追踪链接覆盖各环节，保证需求到交付的双向可追溯。
--   5) 总体架构（T005）：登记架构组件（应用/数据/技术/安全分层）与组件间关系（调用/依赖/同步/复制），
--      支撑六系统边界、部署拓扑、容灾与扩展策略的统一治理。
-- 注意：
--   a) 业务字段一律不得命名为 version，避免与 BaseEntity 的乐观锁字段 version 冲突。
--   b) 各表主编码/唯一键存在硬唯一索引；为与唯一索引保持一致，本模块删除语义为「释放编码」，
--      由服务层执行物理删除（与 G1-N1 及其后各节点同一处理方式）。

-- ========== T001 项目治理：项目 ==========

CREATE TABLE sys_gov_project (
    id              BIGINT        NOT NULL,
    project_no      VARCHAR(64)   NOT NULL,
    project_code    VARCHAR(64),
    project_name    VARCHAR(200)  NOT NULL,
    project_type    VARCHAR(32)   NOT NULL DEFAULT 'PLATFORM',
    sponsor         VARCHAR(128),
    manager_name    VARCHAR(128),
    start_date      TIMESTAMP,
    end_date        TIMESTAMP,
    project_status  VARCHAR(32)   NOT NULL DEFAULT 'PLANNING',
    scope_desc      VARCHAR(2000),
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
CREATE UNIQUE INDEX uk_sys_gov_project_no ON sys_gov_project (project_no);
CREATE INDEX idx_sys_gov_project_status ON sys_gov_project (project_status);

-- ========== T001 项目治理：里程碑 ==========

CREATE TABLE sys_gov_milestone (
    id               BIGINT       NOT NULL,
    milestone_no     VARCHAR(64)  NOT NULL,
    project_code     VARCHAR(64)  NOT NULL,
    milestone_code   VARCHAR(64),
    milestone_name   VARCHAR(200) NOT NULL,
    plan_date        TIMESTAMP,
    actual_date      TIMESTAMP,
    milestone_status VARCHAR(32)  NOT NULL DEFAULT 'PENDING',
    owner_name       VARCHAR(128),
    deliverable      VARCHAR(1000),
    org_id           BIGINT,
    org_name         VARCHAR(128),
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
CREATE UNIQUE INDEX uk_sys_gov_milestone_no ON sys_gov_milestone (milestone_no);
CREATE INDEX idx_sys_gov_milestone_project ON sys_gov_milestone (project_code);
CREATE INDEX idx_sys_gov_milestone_status ON sys_gov_milestone (milestone_status);

-- ========== T001 项目治理：治理任务 ==========

CREATE TABLE sys_gov_task (
    id           BIGINT       NOT NULL,
    task_no      VARCHAR(64)  NOT NULL,
    project_code VARCHAR(64)  NOT NULL,
    milestone_code VARCHAR(64),
    task_name    VARCHAR(200) NOT NULL,
    task_type    VARCHAR(32)  NOT NULL DEFAULT 'DELIVERY',
    assignee     VARCHAR(128),
    plan_start   TIMESTAMP,
    plan_end     TIMESTAMP,
    actual_end   TIMESTAMP,
    progress     INT          NOT NULL DEFAULT 0,
    task_status  VARCHAR(32)  NOT NULL DEFAULT 'TODO',
    task_priority VARCHAR(16) NOT NULL DEFAULT 'P1',
    org_id       BIGINT,
    org_name     VARCHAR(128),
    description  VARCHAR(1000),
    remark       VARCHAR(500),
    created_by   BIGINT,
    created_at   TIMESTAMP,
    updated_by   BIGINT,
    updated_at   TIMESTAMP,
    deleted      INT          NOT NULL DEFAULT 0,
    version      INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_sys_gov_task_no ON sys_gov_task (task_no);
CREATE INDEX idx_sys_gov_task_project ON sys_gov_task (project_code);
CREATE INDEX idx_sys_gov_task_status ON sys_gov_task (task_status);

-- ========== T001 项目治理：风险/问题/变更 ==========

CREATE TABLE sys_gov_risk (
    id            BIGINT       NOT NULL,
    risk_no       VARCHAR(64)  NOT NULL,
    project_code  VARCHAR(64)  NOT NULL,
    risk_title    VARCHAR(200) NOT NULL,
    risk_type     VARCHAR(32)  NOT NULL DEFAULT 'RISK',
    risk_level    VARCHAR(16)  NOT NULL DEFAULT 'MEDIUM',
    probability   VARCHAR(16),
    impact        VARCHAR(16),
    mitigation    VARCHAR(2000),
    risk_status   VARCHAR(32)  NOT NULL DEFAULT 'OPEN',
    owner_name    VARCHAR(128),
    org_id        BIGINT,
    org_name      VARCHAR(128),
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
CREATE UNIQUE INDEX uk_sys_gov_risk_no ON sys_gov_risk (risk_no);
CREATE INDEX idx_sys_gov_risk_project ON sys_gov_risk (project_code);
CREATE INDEX idx_sys_gov_risk_status ON sys_gov_risk (risk_status);

-- ========== T002 现状盘点：存量系统 ==========

CREATE TABLE sys_gov_asis_system (
    id               BIGINT       NOT NULL,
    system_no        VARCHAR(64)  NOT NULL,
    system_code      VARCHAR(64),
    system_name      VARCHAR(200) NOT NULL,
    system_type      VARCHAR(32)  NOT NULL DEFAULT 'OTHER',
    vendor           VARCHAR(128),
    deploy_mode      VARCHAR(32),
    user_count       INT,
    system_status    VARCHAR(32)  NOT NULL DEFAULT 'ACTIVE',
    migrate_strategy VARCHAR(32),
    org_id           BIGINT,
    org_name         VARCHAR(128),
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
CREATE UNIQUE INDEX uk_sys_gov_asis_system_no ON sys_gov_asis_system (system_no);
CREATE INDEX idx_sys_gov_asis_system_type ON sys_gov_asis_system (system_type);
CREATE INDEX idx_sys_gov_asis_system_status ON sys_gov_asis_system (system_status);

-- ========== T002 现状盘点：盘点发现 ==========

CREATE TABLE sys_gov_asis_finding (
    id            BIGINT       NOT NULL,
    finding_no    VARCHAR(64)  NOT NULL,
    system_code   VARCHAR(64),
    finding_type  VARCHAR(32)  NOT NULL DEFAULT 'PAIN_POINT',
    finding_title VARCHAR(200) NOT NULL,
    finding_desc  VARCHAR(2000),
    severity      VARCHAR(16)  NOT NULL DEFAULT 'MEDIUM',
    suggestion    VARCHAR(2000),
    finding_status VARCHAR(32) NOT NULL DEFAULT 'OPEN',
    org_id        BIGINT,
    org_name      VARCHAR(128),
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
CREATE UNIQUE INDEX uk_sys_gov_asis_finding_no ON sys_gov_asis_finding (finding_no);
CREATE INDEX idx_sys_gov_asis_finding_system ON sys_gov_asis_finding (system_code);
CREATE INDEX idx_sys_gov_asis_finding_status ON sys_gov_asis_finding (finding_status);

-- ========== T003 流程建模：端到端流程 ==========

CREATE TABLE sys_gov_process (
    id             BIGINT       NOT NULL,
    process_no     VARCHAR(64)  NOT NULL,
    process_code   VARCHAR(64)  NOT NULL,
    process_name   VARCHAR(200) NOT NULL,
    process_type   VARCHAR(32)  NOT NULL DEFAULT 'O2C',
    process_level  VARCHAR(16)  NOT NULL DEFAULT 'L1',
    owner_dept     VARCHAR(128),
    process_status VARCHAR(32)  NOT NULL DEFAULT 'DRAFT',
    org_id         BIGINT,
    org_name       VARCHAR(128),
    description    VARCHAR(2000),
    remark         VARCHAR(500),
    created_by     BIGINT,
    created_at     TIMESTAMP,
    updated_by     BIGINT,
    updated_at     TIMESTAMP,
    deleted        INT          NOT NULL DEFAULT 0,
    version        INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_sys_gov_process_no ON sys_gov_process (process_no);
CREATE UNIQUE INDEX uk_sys_gov_process_code ON sys_gov_process (process_code);
CREATE INDEX idx_sys_gov_process_type ON sys_gov_process (process_type);
CREATE INDEX idx_sys_gov_process_status ON sys_gov_process (process_status);

-- ========== T003 流程建模：流程节点 ==========

CREATE TABLE sys_gov_process_node (
    id             BIGINT       NOT NULL,
    node_no        VARCHAR(64)  NOT NULL,
    process_code   VARCHAR(64)  NOT NULL,
    node_code      VARCHAR(64),
    node_name      VARCHAR(200) NOT NULL,
    node_type      VARCHAR(32)  NOT NULL DEFAULT 'ACTIVITY',
    seq_no         INT          NOT NULL DEFAULT 1,
    role_name      VARCHAR(128),
    system_domain  VARCHAR(32),
    input_artifact VARCHAR(500),
    output_artifact VARCHAR(500),
    node_status    VARCHAR(32)  NOT NULL DEFAULT 'ACTIVE',
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
CREATE UNIQUE INDEX uk_sys_gov_process_node_no ON sys_gov_process_node (node_no);
CREATE INDEX idx_sys_gov_process_node_process ON sys_gov_process_node (process_code);
CREATE INDEX idx_sys_gov_process_node_status ON sys_gov_process_node (node_status);

-- ========== T004 需求追踪：需求 ==========

CREATE TABLE sys_gov_requirement (
    id                  BIGINT       NOT NULL,
    req_no              VARCHAR(64)  NOT NULL,
    req_code            VARCHAR(64),
    req_name            VARCHAR(200) NOT NULL,
    req_type            VARCHAR(32)  NOT NULL DEFAULT 'BUSINESS',
    source              VARCHAR(200),
    biz_module          VARCHAR(32),
    req_priority        VARCHAR(16)  NOT NULL DEFAULT 'P1',
    req_status          VARCHAR(32)  NOT NULL DEFAULT 'PROPOSED',
    acceptance_criteria VARCHAR(2000),
    owner_name          VARCHAR(128),
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
CREATE UNIQUE INDEX uk_sys_gov_requirement_no ON sys_gov_requirement (req_no);
CREATE INDEX idx_sys_gov_requirement_type ON sys_gov_requirement (req_type);
CREATE INDEX idx_sys_gov_requirement_status ON sys_gov_requirement (req_status);

-- ========== T004 需求追踪：追踪矩阵 ==========

CREATE TABLE sys_gov_trace_link (
    id           BIGINT       NOT NULL,
    link_no      VARCHAR(64)  NOT NULL,
    req_code     VARCHAR(64)  NOT NULL,
    link_type    VARCHAR(32)  NOT NULL DEFAULT 'FUNCTION',
    target_ref   VARCHAR(200),
    target_name  VARCHAR(200),
    link_desc    VARCHAR(1000),
    link_status  VARCHAR(32)  NOT NULL DEFAULT 'ACTIVE',
    org_id       BIGINT,
    org_name     VARCHAR(128),
    description  VARCHAR(1000),
    remark       VARCHAR(500),
    created_by   BIGINT,
    created_at   TIMESTAMP,
    updated_by   BIGINT,
    updated_at   TIMESTAMP,
    deleted      INT          NOT NULL DEFAULT 0,
    version      INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_sys_gov_trace_link_no ON sys_gov_trace_link (link_no);
CREATE INDEX idx_sys_gov_trace_link_req ON sys_gov_trace_link (req_code);
CREATE INDEX idx_sys_gov_trace_link_type ON sys_gov_trace_link (link_type);

-- ========== T005 总体架构：架构组件 ==========

CREATE TABLE sys_gov_arch_component (
    id              BIGINT       NOT NULL,
    component_no    VARCHAR(64)  NOT NULL,
    component_code  VARCHAR(64),
    component_name  VARCHAR(200) NOT NULL,
    arch_layer      VARCHAR(32)  NOT NULL DEFAULT 'APPLICATION',
    system_domain   VARCHAR(32),
    component_type  VARCHAR(64),
    tech_stack      VARCHAR(500),
    deploy_unit     VARCHAR(128),
    component_status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    org_id          BIGINT,
    org_name        VARCHAR(128),
    description     VARCHAR(2000),
    remark          VARCHAR(500),
    created_by      BIGINT,
    created_at      TIMESTAMP,
    updated_by      BIGINT,
    updated_at      TIMESTAMP,
    deleted         INT          NOT NULL DEFAULT 0,
    version         INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_sys_gov_arch_component_no ON sys_gov_arch_component (component_no);
CREATE INDEX idx_sys_gov_arch_component_layer ON sys_gov_arch_component (arch_layer);
CREATE INDEX idx_sys_gov_arch_component_status ON sys_gov_arch_component (component_status);

-- ========== T005 总体架构：架构关系 ==========

CREATE TABLE sys_gov_arch_relation (
    id               BIGINT       NOT NULL,
    relation_no      VARCHAR(64)  NOT NULL,
    source_component VARCHAR(64)  NOT NULL,
    target_component VARCHAR(64)  NOT NULL,
    relation_type    VARCHAR(32)  NOT NULL DEFAULT 'CALL',
    protocol         VARCHAR(64),
    relation_desc    VARCHAR(1000),
    relation_status  VARCHAR(32)  NOT NULL DEFAULT 'ACTIVE',
    org_id           BIGINT,
    org_name         VARCHAR(128),
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
CREATE UNIQUE INDEX uk_sys_gov_arch_relation_no ON sys_gov_arch_relation (relation_no);
CREATE INDEX idx_sys_gov_arch_relation_source ON sys_gov_arch_relation (source_component);
CREATE INDEX idx_sys_gov_arch_relation_target ON sys_gov_arch_relation (target_component);
