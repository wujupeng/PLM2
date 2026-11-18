-- G1-N6 公共平台底座—通用能力（对应总任务书 WBS T104，公共能力，服务 G1-G8 全部系统）：
-- 业务规则引擎：交期、最小起订量、批量、替代料、FIFO、质量放行、信用额度等规则配置。
-- 说明：SQL 同时兼容 PostgreSQL 与 H2（PostgreSQL 兼容模式），主键由应用侧雪花算法生成。
-- 设计原则：
--   1) 业务规则（biz rule）按规则类型（LEAD_TIME/MOQ/LOT_SIZE/SUBSTITUTE/FIFO/QUALITY_RELEASE/CREDIT_LIMIT）
--      与业务模块登记规则主体，priority 数值越小优先级越高，rule_expr 保存可读表达式便于人工核查。
--   2) 规则参数（biz rule param）结构化登记规则的可配置参数（键、值、值类型），
--      避免各系统把阈值硬编码在代码里，参数变更无需改代码。
--   3) 规则执行日志（biz rule log）记录规则每次被求值的输入、输出与命中结果及耗时，
--      供规则效果分析与问题追溯，日志只追加不修改。
-- 注意：
--   a) 业务字段一律不得命名为 version，避免与 BaseEntity 的乐观锁字段 version 冲突。
--   b) 各表主编码/唯一键存在硬唯一索引；为与唯一索引保持一致，本模块删除语义为「释放编码」，
--      由服务层执行物理删除（与 G1-N1 及其后各节点同一处理方式）。

-- ========== 业务规则定义（T104） ==========

CREATE TABLE sys_biz_rule (
    id          BIGINT       NOT NULL,
    rule_no     VARCHAR(64)  NOT NULL,
    rule_code   VARCHAR(64),
    rule_name   VARCHAR(128) NOT NULL,
    rule_type   VARCHAR(32)  NOT NULL DEFAULT 'LEAD_TIME',
    biz_module  VARCHAR(32),
    rule_expr   VARCHAR(2000),
    priority    INT          NOT NULL DEFAULT 100,
    rule_status VARCHAR(32)  NOT NULL DEFAULT 'ACTIVE',
    org_id      BIGINT,
    org_name    VARCHAR(128),
    description VARCHAR(1000),
    remark      VARCHAR(500),
    created_by  BIGINT,
    created_at  TIMESTAMP,
    updated_by  BIGINT,
    updated_at  TIMESTAMP,
    deleted     INT          NOT NULL DEFAULT 0,
    version     INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_sys_biz_rule_no ON sys_biz_rule (rule_no);
CREATE INDEX idx_sys_biz_rule_code ON sys_biz_rule (rule_code);
CREATE INDEX idx_sys_biz_rule_type ON sys_biz_rule (rule_type);
CREATE INDEX idx_sys_biz_rule_status ON sys_biz_rule (rule_status);

-- ========== 规则参数（T104） ==========

CREATE TABLE sys_biz_rule_param (
    id           BIGINT       NOT NULL,
    param_no     VARCHAR(64)  NOT NULL,
    rule_code    VARCHAR(64)  NOT NULL,
    param_key    VARCHAR(64)  NOT NULL,
    param_name   VARCHAR(128),
    param_value  VARCHAR(1000),
    value_type   VARCHAR(32)  NOT NULL DEFAULT 'STRING',
    seq_no       INT          NOT NULL DEFAULT 0,
    param_status VARCHAR(32)  NOT NULL DEFAULT 'ACTIVE',
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
CREATE UNIQUE INDEX uk_sys_biz_rule_param_no ON sys_biz_rule_param (param_no);
CREATE INDEX idx_sys_biz_rule_param_rule ON sys_biz_rule_param (rule_code);

-- ========== 规则执行日志（T104） ==========

CREATE TABLE sys_biz_rule_log (
    id           BIGINT       NOT NULL,
    log_no       VARCHAR(64)  NOT NULL,
    rule_code    VARCHAR(64),
    biz_module   VARCHAR(32),
    biz_key      VARCHAR(128),
    input_data   VARCHAR(2000),
    output_data  VARCHAR(2000),
    match_result VARCHAR(32)  NOT NULL DEFAULT 'MATCH',
    cost_ms      INT          NOT NULL DEFAULT 0,
    exec_time    TIMESTAMP,
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
CREATE UNIQUE INDEX uk_sys_biz_rule_log_no ON sys_biz_rule_log (log_no);
CREATE INDEX idx_sys_biz_rule_log_rule ON sys_biz_rule_log (rule_code);
CREATE INDEX idx_sys_biz_rule_log_key ON sys_biz_rule_log (biz_key);
CREATE INDEX idx_sys_biz_rule_log_time ON sys_biz_rule_log (exec_time);
