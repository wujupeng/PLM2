-- G1-N6 公共平台底座—通用能力（对应总任务书 WBS T103，公共能力，服务 G1-G8 全部系统）：
-- 可配置审批：金额/物料类别/客户/供应商/工厂/风险等级等条件驱动审批。
-- 说明：SQL 同时兼容 PostgreSQL 与 H2（PostgreSQL 兼容模式），主键由应用侧雪花算法生成。
-- 设计原则：
--   1) 审批流定义（approval flow）按单据类型与业务模块登记一条流程，
--      priority 决定多条流程命中时优先级，condition_expr 保存可读条件表达式便于人工核查。
--   2) 审批条件（approval condition）按「字段 + 比较符 + 比较值 + 逻辑连接」结构化登记，
--      引擎按 seq_no 顺序与 logic_type 计算是否命中该流程，支持金额/物料类别/客户/供应商/工厂/风险等级等任意字段。
--   3) 审批节点（approval node）定义流程内审批顺序、审批人（角色/用户/组织）、
--      审批方式（ANY 或签 / ALL 会签），allow_transfer 允许转办。
--   4) 审批实例（approval instance）记录单据提交审批的运行态（当前节点、状态），
--      5) 审批任务（approval task）记录每个节点上具体审批人的待办与处理结果（含处理意见与时间）。
-- 注意：
--   a) 业务字段一律不得命名为 version，避免与 BaseEntity 的乐观锁字段 version 冲突；
--      同时规避数据库保留字，比较符列命名 compare_operator，处理意见列命名 handle_comment。
--   b) 各表主编码/唯一键存在硬唯一索引；为与唯一索引保持一致，本模块删除语义为「释放编码」，
--      由服务层执行物理删除（与 G1-N1 及其后各节点同一处理方式）。

-- ========== 审批流定义（T103） ==========

CREATE TABLE sys_approval_flow (
    id             BIGINT       NOT NULL,
    flow_no        VARCHAR(64)  NOT NULL,
    flow_code      VARCHAR(64),
    flow_name      VARCHAR(128) NOT NULL,
    doc_type       VARCHAR(64)  NOT NULL,
    biz_module     VARCHAR(32),
    condition_expr VARCHAR(1000),
    priority       INT          NOT NULL DEFAULT 0,
    flow_status    VARCHAR(32)  NOT NULL DEFAULT 'ACTIVE',
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
CREATE UNIQUE INDEX uk_sys_approval_flow_no ON sys_approval_flow (flow_no);
CREATE INDEX idx_sys_approval_flow_code ON sys_approval_flow (flow_code);
CREATE INDEX idx_sys_approval_flow_doc ON sys_approval_flow (doc_type);
CREATE INDEX idx_sys_approval_flow_status ON sys_approval_flow (flow_status);

-- ========== 审批条件（T103） ==========

CREATE TABLE sys_approval_condition (
    id                BIGINT       NOT NULL,
    condition_no      VARCHAR(64)  NOT NULL,
    flow_code         VARCHAR(64)  NOT NULL,
    seq_no            INT          NOT NULL DEFAULT 0,
    field_key         VARCHAR(64)  NOT NULL,
    compare_operator  VARCHAR(32)  NOT NULL DEFAULT 'EQ',
    compare_value     VARCHAR(512),
    logic_type        VARCHAR(16)  NOT NULL DEFAULT 'AND',
    condition_status  VARCHAR(32)  NOT NULL DEFAULT 'ACTIVE',
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
CREATE UNIQUE INDEX uk_sys_approval_condition_no ON sys_approval_condition (condition_no);
CREATE INDEX idx_sys_approval_condition_flow ON sys_approval_condition (flow_code);

-- ========== 审批节点（T103） ==========

CREATE TABLE sys_approval_node (
    id             BIGINT       NOT NULL,
    node_no        VARCHAR(64)  NOT NULL,
    flow_code      VARCHAR(64)  NOT NULL,
    node_order     INT          NOT NULL DEFAULT 1,
    node_name      VARCHAR(128) NOT NULL,
    approver_type  VARCHAR(32)  NOT NULL DEFAULT 'ROLE',
    approver_value VARCHAR(256),
    approve_mode   VARCHAR(16)  NOT NULL DEFAULT 'ANY',
    allow_transfer INT          NOT NULL DEFAULT 0,
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
CREATE UNIQUE INDEX uk_sys_approval_node_no ON sys_approval_node (node_no);
CREATE INDEX idx_sys_approval_node_flow ON sys_approval_node (flow_code);
CREATE INDEX idx_sys_approval_node_status ON sys_approval_node (node_status);

-- ========== 审批实例（T103） ==========

CREATE TABLE sys_approval_instance (
    id              BIGINT       NOT NULL,
    instance_no     VARCHAR(64)  NOT NULL,
    flow_code       VARCHAR(64)  NOT NULL,
    doc_type        VARCHAR(64)  NOT NULL,
    doc_no          VARCHAR(64)  NOT NULL,
    biz_title       VARCHAR(256),
    submitter_id    BIGINT,
    submitter_name  VARCHAR(128),
    submit_time     TIMESTAMP,
    current_node    VARCHAR(64),
    instance_status VARCHAR(32)  NOT NULL DEFAULT 'PENDING',
    finished_time   TIMESTAMP,
    org_id          BIGINT,
    org_name        VARCHAR(128),
    description     VARCHAR(1000),
    remark          VARCHAR(500),
    created_by      BIGINT,
    created_at      TIMESTAMP,
    updated_by      BIGINT,
    updated_at      TIMESTAMP,
    deleted         INT          NOT NULL DEFAULT 0,
    version         INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_sys_approval_instance_no ON sys_approval_instance (instance_no);
CREATE INDEX idx_sys_approval_instance_doc ON sys_approval_instance (doc_type, doc_no);
CREATE INDEX idx_sys_approval_instance_status ON sys_approval_instance (instance_status);

-- ========== 审批任务（T103） ==========

CREATE TABLE sys_approval_task (
    id             BIGINT       NOT NULL,
    task_no        VARCHAR(64)  NOT NULL,
    instance_no    VARCHAR(64)  NOT NULL,
    node_no        VARCHAR(64)  NOT NULL,
    approver_id    BIGINT,
    approver_name  VARCHAR(128),
    task_status    VARCHAR(32)  NOT NULL DEFAULT 'PENDING',
    handle_comment VARCHAR(1000),
    handled_time   TIMESTAMP,
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
CREATE UNIQUE INDEX uk_sys_approval_task_no ON sys_approval_task (task_no);
CREATE INDEX idx_sys_approval_task_instance ON sys_approval_task (instance_no);
CREATE INDEX idx_sys_approval_task_status ON sys_approval_task (task_status);
