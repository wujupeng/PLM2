-- OA-N3 低代码表单与工作流引擎：表单定义与字段、流程定义与节点、流程实例、审批任务、审批轨迹
-- 说明：SQL 同时兼容 PostgreSQL 与 H2（PostgreSQL 兼容模式），主键由应用侧雪花算法生成。
-- 设计原则：表单字段与流程节点全部以可配置数据存储（不写死在代码里），管理员可通过界面新增审批流程与表单。
-- 注意：业务字段一律不得命名为 version，避免与 BaseEntity 的乐观锁字段 version 冲突。

-- ========== 表单定义 ==========

CREATE TABLE oa_form_definition (
    id          BIGINT       NOT NULL,
    form_code   VARCHAR(64)  NOT NULL,
    form_name   VARCHAR(128) NOT NULL,
    category    VARCHAR(64),
    version_no  INT          NOT NULL DEFAULT 1,
    status      VARCHAR(32)  NOT NULL DEFAULT 'DRAFT',
    schema_json TEXT,
    description VARCHAR(500),
    remark      VARCHAR(255),
    created_by  BIGINT,
    created_at  TIMESTAMP,
    updated_by  BIGINT,
    updated_at  TIMESTAMP,
    deleted     INT          NOT NULL DEFAULT 0,
    version     INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_oa_form_definition_code ON oa_form_definition (form_code);
CREATE INDEX idx_oa_form_definition_category ON oa_form_definition (category);

-- ========== 表单字段 ==========

CREATE TABLE oa_form_field (
    id           BIGINT       NOT NULL,
    form_id      BIGINT       NOT NULL,
    field_code   VARCHAR(64)  NOT NULL,
    field_name   VARCHAR(128) NOT NULL,
    field_type   VARCHAR(32)  NOT NULL DEFAULT 'TEXT',
    required_flag INT         NOT NULL DEFAULT 0,
    data_source  VARCHAR(32)  NOT NULL DEFAULT 'MANUAL',
    source_value VARCHAR(256),
    options_json TEXT,
    rules_json   TEXT,
    placeholder  VARCHAR(256),
    sort_no      INT          NOT NULL DEFAULT 0,
    remark       VARCHAR(255),
    created_by   BIGINT,
    created_at   TIMESTAMP,
    updated_by   BIGINT,
    updated_at   TIMESTAMP,
    deleted      INT          NOT NULL DEFAULT 0,
    version      INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE INDEX idx_oa_form_field_form ON oa_form_field (form_id);

-- ========== 流程定义 ==========

CREATE TABLE oa_process_definition (
    id              BIGINT       NOT NULL,
    process_code    VARCHAR(64)  NOT NULL,
    process_name    VARCHAR(128) NOT NULL,
    form_id         BIGINT,
    category        VARCHAR(64),
    version_no      INT          NOT NULL DEFAULT 1,
    status          VARCHAR(32)  NOT NULL DEFAULT 'DRAFT',
    definition_json TEXT,
    description     VARCHAR(500),
    remark          VARCHAR(255),
    created_by      BIGINT,
    created_at      TIMESTAMP,
    updated_by      BIGINT,
    updated_at      TIMESTAMP,
    deleted         INT          NOT NULL DEFAULT 0,
    version         INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_oa_process_definition_code ON oa_process_definition (process_code);
CREATE INDEX idx_oa_process_definition_form ON oa_process_definition (form_id);

-- ========== 流程节点 ==========

CREATE TABLE oa_process_node (
    id             BIGINT       NOT NULL,
    process_id     BIGINT       NOT NULL,
    node_code      VARCHAR(64)  NOT NULL,
    node_name      VARCHAR(128) NOT NULL,
    node_type      VARCHAR(32)  NOT NULL DEFAULT 'APPROVAL',
    approver_type  VARCHAR(32)  NOT NULL DEFAULT 'ROLE',
    approver_value VARCHAR(256),
    allow_delegate INT          NOT NULL DEFAULT 1,
    sort_no        INT          NOT NULL DEFAULT 0,
    remark         VARCHAR(255),
    created_by     BIGINT,
    created_at     TIMESTAMP,
    updated_by     BIGINT,
    updated_at     TIMESTAMP,
    deleted        INT          NOT NULL DEFAULT 0,
    version        INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE INDEX idx_oa_process_node_process ON oa_process_node (process_id);

-- ========== 流程实例 ==========

CREATE TABLE oa_process_instance (
    id                BIGINT       NOT NULL,
    instance_no       VARCHAR(64)  NOT NULL,
    process_id        BIGINT       NOT NULL,
    process_code      VARCHAR(64),
    process_name      VARCHAR(128),
    form_id           BIGINT,
    business_key      VARCHAR(64),
    title             VARCHAR(256),
    applicant_user_id BIGINT       NOT NULL,
    applicant_name    VARCHAR(64),
    instance_status   VARCHAR(32)  NOT NULL DEFAULT 'DRAFT',
    current_node_code VARCHAR(64),
    form_data_json    TEXT,
    submitted_at      TIMESTAMP,
    finished_at       TIMESTAMP,
    remark            VARCHAR(255),
    created_by        BIGINT,
    created_at        TIMESTAMP,
    updated_by        BIGINT,
    updated_at        TIMESTAMP,
    deleted           INT          NOT NULL DEFAULT 0,
    version           INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_oa_process_instance_no ON oa_process_instance (instance_no);
CREATE INDEX idx_oa_process_instance_applicant ON oa_process_instance (applicant_user_id);
CREATE INDEX idx_oa_process_instance_status ON oa_process_instance (instance_status);

-- ========== 审批任务 ==========

CREATE TABLE oa_task (
    id               BIGINT       NOT NULL,
    task_no          VARCHAR(64)  NOT NULL,
    instance_id      BIGINT       NOT NULL,
    node_code        VARCHAR(64),
    node_name        VARCHAR(128),
    assignee_user_id BIGINT       NOT NULL,
    assignee_name    VARCHAR(64),
    task_status      VARCHAR(32)  NOT NULL DEFAULT 'PENDING',
    action           VARCHAR(32),
    comment_text     VARCHAR(512),
    due_at           TIMESTAMP,
    handled_at       TIMESTAMP,
    remark           VARCHAR(255),
    created_by       BIGINT,
    created_at       TIMESTAMP,
    updated_by       BIGINT,
    updated_at       TIMESTAMP,
    deleted          INT          NOT NULL DEFAULT 0,
    version          INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_oa_task_no ON oa_task (task_no);
CREATE INDEX idx_oa_task_instance ON oa_task (instance_id);
CREATE INDEX idx_oa_task_assignee ON oa_task (assignee_user_id, task_status);

-- ========== 审批轨迹 ==========

CREATE TABLE oa_task_record (
    id               BIGINT       NOT NULL,
    instance_id      BIGINT       NOT NULL,
    task_id          BIGINT,
    node_code        VARCHAR(64),
    node_name        VARCHAR(128),
    operator_user_id BIGINT,
    operator_name    VARCHAR(64),
    action           VARCHAR(32),
    comment_text     VARCHAR(512),
    operated_at      TIMESTAMP,
    created_by       BIGINT,
    created_at       TIMESTAMP,
    updated_by       BIGINT,
    updated_at       TIMESTAMP,
    deleted          INT          NOT NULL DEFAULT 0,
    version          INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE INDEX idx_oa_task_record_instance ON oa_task_record (instance_id);
