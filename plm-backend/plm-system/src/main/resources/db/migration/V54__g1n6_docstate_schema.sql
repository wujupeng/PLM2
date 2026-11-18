-- G1-N6 公共平台底座—通用能力（对应总任务书 WBS T102，公共能力，服务 G1-G8 全部系统）：
-- 单据状态机：草稿、提交、审核、执行、关闭、作废、红字/冲销等状态及反向控制。
-- 说明：SQL 同时兼容 PostgreSQL 与 H2（PostgreSQL 兼容模式），主键由应用侧雪花算法生成。
-- 设计原则：
--   1) 状态定义（doc state definition）按「单据类型 + 状态编码」登记状态语义，
--      状态类型覆盖 DRAFT/SUBMITTED/APPROVED/EXECUTING/CLOSED/VOID/REVERSED，
--      并通过 is_initial/is_final 标识起始态与终态，allow_edit/allow_delete 控制该状态下是否可编辑、可删除。
--   2) 流转规则（doc transition）按「单据类型 + 起始状态 + 动作」登记目标状态，
--      正/反向流转用 transition_type 区分（FORWARD 正向、REVERSE 反向/红冲），
--      并可要求审批（require_approval）或填写原因（require_reason），权限码 permission_code 控制允许执行的角色。
--   3) 状态日志（doc state log）记录单据每一次状态变更的轨迹（含操作人、时间、原因），
--      供审计追踪与问题定位，日志只追加不修改。
-- 注意：
--   a) 业务字段一律不得命名为 version，避免与 BaseEntity 的乐观锁字段 version 冲突。
--   b) 各表主编码/唯一键（doc_type+state_code、doc_type+from_state+action_code、log_no）存在硬唯一索引；
--      为与唯一索引保持一致，本模块删除语义为「释放编码」，由服务层执行物理删除
--      （与 G1-N1 及其后各节点同一处理方式）。

-- ========== 单据状态定义（T102） ==========

CREATE TABLE sys_doc_state_def (
    id             BIGINT       NOT NULL,
    doc_type       VARCHAR(64)  NOT NULL,
    state_code     VARCHAR(32)  NOT NULL,
    state_name     VARCHAR(128) NOT NULL,
    state_type     VARCHAR(32)  NOT NULL DEFAULT 'DRAFT',
    is_initial     INT          NOT NULL DEFAULT 0,
    is_final       INT          NOT NULL DEFAULT 0,
    allow_edit     INT          NOT NULL DEFAULT 0,
    allow_delete   INT          NOT NULL DEFAULT 0,
    sort_no        INT          NOT NULL DEFAULT 0,
    state_status   VARCHAR(32)  NOT NULL DEFAULT 'ACTIVE',
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
CREATE UNIQUE INDEX uk_sys_doc_state_def_key ON sys_doc_state_def (doc_type, state_code);
CREATE INDEX idx_sys_doc_state_def_type ON sys_doc_state_def (doc_type);
CREATE INDEX idx_sys_doc_state_def_status ON sys_doc_state_def (state_status);

-- ========== 单据状态流转规则（T102） ==========

CREATE TABLE sys_doc_transition (
    id               BIGINT       NOT NULL,
    doc_type         VARCHAR(64)  NOT NULL,
    from_state       VARCHAR(32)  NOT NULL,
    to_state         VARCHAR(32)  NOT NULL,
    action_code      VARCHAR(64)  NOT NULL,
    action_name      VARCHAR(128) NOT NULL,
    transition_type  VARCHAR(32)  NOT NULL DEFAULT 'FORWARD',
    require_approval INT          NOT NULL DEFAULT 0,
    require_reason   INT          NOT NULL DEFAULT 0,
    permission_code  VARCHAR(128),
    transition_status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
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
CREATE UNIQUE INDEX uk_sys_doc_transition_key ON sys_doc_transition (doc_type, from_state, action_code);
CREATE INDEX idx_sys_doc_transition_type ON sys_doc_transition (doc_type);
CREATE INDEX idx_sys_doc_transition_status ON sys_doc_transition (transition_status);

-- ========== 单据状态流转日志（T102） ==========

CREATE TABLE sys_doc_state_log (
    id            BIGINT       NOT NULL,
    log_no        VARCHAR(64)  NOT NULL,
    doc_type      VARCHAR(64)  NOT NULL,
    doc_no        VARCHAR(64)  NOT NULL,
    biz_title     VARCHAR(256),
    from_state    VARCHAR(32),
    to_state      VARCHAR(32)  NOT NULL,
    action_code   VARCHAR(64),
    action_name   VARCHAR(128),
    reason        VARCHAR(500),
    operator_id   BIGINT,
    operator_name VARCHAR(128),
    operate_time  TIMESTAMP,
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
CREATE UNIQUE INDEX uk_sys_doc_state_log_no ON sys_doc_state_log (log_no);
CREATE INDEX idx_sys_doc_state_log_doc ON sys_doc_state_log (doc_type, doc_no);
CREATE INDEX idx_sys_doc_state_log_time ON sys_doc_state_log (operate_time);
