-- G1-N6 公共平台底座—通用能力（对应总任务书 WBS T105，公共能力，服务 G1-G8 全部系统）：
-- 数据质量控制：必填、唯一性、编码规则、有效期、版本一致性、引用完整性和异常队列。
-- 说明：SQL 同时兼容 PostgreSQL 与 H2（PostgreSQL 兼容模式），主键由应用侧雪花算法生成。
-- 设计原则：
--   1) 数据质量规则（data quality rule）按目标实体（target_entity）登记校验类型
--      （REQUIRED 必填/UNIQUE 唯一性/CODE_PATTERN 编码规则/VALIDITY 有效期/VERSION_CONSISTENCY 版本一致性/REFERENCE 引用完整性）、
--      校验表达式与异常级别（ERROR 阻断/WARN 提示），供各系统在保存时统一校验。
--   2) 数据异常队列（data quality exception）承接校验不通过的数据记录，
--      记录规则、目标实体、记录主键与业务键、异常信息与处理状态（OPEN/HANDLING/RESOLVED/IGNORED），
--      由数据管家在队列中处理，避免脏数据在各系统间扩散。
--   3) 编码规则（code rule）登记目标实体的编码前缀、日期段、流水号长度与重置周期，
--      并维护当前流水值，供各系统统一生成合规编码，避免各系统自造编码规则。
-- 注意：
--   a) 业务字段一律不得命名为 version，避免与 BaseEntity 的乐观锁字段 version 冲突。
--   b) 各表主编码/唯一键存在硬唯一索引；为与唯一索引保持一致，本模块删除语义为「释放编码」，
--      由服务层执行物理删除（与 G1-N1 及其后各节点同一处理方式）。

-- ========== 数据质量规则（T105） ==========

CREATE TABLE sys_data_quality_rule (
    id            BIGINT       NOT NULL,
    rule_no       VARCHAR(64)  NOT NULL,
    rule_code     VARCHAR(64),
    rule_name     VARCHAR(128) NOT NULL,
    target_entity VARCHAR(64)  NOT NULL,
    rule_type     VARCHAR(32)  NOT NULL DEFAULT 'REQUIRED',
    rule_expr     VARCHAR(2000),
    error_level   VARCHAR(16)  NOT NULL DEFAULT 'ERROR',
    rule_status   VARCHAR(32)  NOT NULL DEFAULT 'ACTIVE',
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
CREATE UNIQUE INDEX uk_sys_data_quality_rule_no ON sys_data_quality_rule (rule_no);
CREATE INDEX idx_sys_data_quality_rule_entity ON sys_data_quality_rule (target_entity);
CREATE INDEX idx_sys_data_quality_rule_type ON sys_data_quality_rule (rule_type);
CREATE INDEX idx_sys_data_quality_rule_status ON sys_data_quality_rule (rule_status);

-- ========== 数据异常队列（T105） ==========

CREATE TABLE sys_data_quality_exception (
    id               BIGINT        NOT NULL,
    exception_no     VARCHAR(64)   NOT NULL,
    rule_code        VARCHAR(64)   NOT NULL,
    target_entity    VARCHAR(64)   NOT NULL,
    record_id        BIGINT,
    record_key       VARCHAR(128),
    error_level      VARCHAR(16)   NOT NULL DEFAULT 'ERROR',
    error_message    VARCHAR(1000),
    exception_status VARCHAR(32)   NOT NULL DEFAULT 'OPEN',
    handler_name     VARCHAR(128),
    handled_time     TIMESTAMP,
    handle_note      VARCHAR(1000),
    org_id           BIGINT,
    org_name         VARCHAR(128),
    description      VARCHAR(1000),
    remark           VARCHAR(500),
    created_by       BIGINT,
    created_at       TIMESTAMP,
    updated_by       BIGINT,
    updated_at       TIMESTAMP,
    deleted          INT           NOT NULL DEFAULT 0,
    version          INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_sys_data_quality_exception_no ON sys_data_quality_exception (exception_no);
CREATE INDEX idx_sys_data_quality_exception_rule ON sys_data_quality_exception (rule_code);
CREATE INDEX idx_sys_data_quality_exception_status ON sys_data_quality_exception (exception_status);

-- ========== 编码规则（T105） ==========

CREATE TABLE sys_code_rule (
    id            BIGINT       NOT NULL,
    code_no       VARCHAR(64)  NOT NULL,
    code_code     VARCHAR(64),
    code_name     VARCHAR(128) NOT NULL,
    target_entity VARCHAR(64)  NOT NULL,
    prefix        VARCHAR(32),
    date_pattern  VARCHAR(32),
    seq_length    INT          NOT NULL DEFAULT 4,
    reset_cycle   VARCHAR(16)  NOT NULL DEFAULT 'NONE',
    current_seq   INT          NOT NULL DEFAULT 0,
    code_status   VARCHAR(32)  NOT NULL DEFAULT 'ACTIVE',
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
CREATE UNIQUE INDEX uk_sys_code_rule_no ON sys_code_rule (code_no);
CREATE INDEX idx_sys_code_rule_entity ON sys_code_rule (target_entity);
CREATE INDEX idx_sys_code_rule_status ON sys_code_rule (code_status);
