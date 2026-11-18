-- G1-N5 公共平台底座—多币种多税率（对应总任务书 WBS T101，公共能力，服务 G1-G8 全部系统）：
-- 币种、汇率、税率、含税/未税价格及舍入规则。
-- 说明：SQL 同时兼容 PostgreSQL 与 H2（PostgreSQL 兼容模式），主键由应用侧雪花算法生成。
-- 设计原则：
--   1) 币种（currency）登记 ISO 币种编码、符号与金额精度；本位币用 base_flag 唯一标识，
--      多法人场景下本位币由法人主体（sys_legal_entity.base_currency）与全局默认值共同决定。
--   2) 汇率（exchange rate）按「源币种 + 目标币种 + 汇率类型 + 生效区间」登记，
--      同一币种对可存在多个生效区间与多种汇率类型（即期/买入/卖出/中间价），
--      业务取价按生效日期落在 effective_date 与 expire_date 之间匹配，避免历史汇率被覆盖。
--   3) 税率（tax rate）按税率编码与适用国家登记，税率以百分数值保存（如 13.0000 表示 13%），
--      同样带生效区间，保证历史单据按当时税率核算。
--   4) 含税/未税价格规则（price rule）登记「价格口径 + 关联税率 + 舍入方式 + 金额精度」，
--      供各业务系统统一做含税/未税换算，避免各系统自造换算公式。
--   5) 舍入规则（rounding rule）登记舍入对象（单价/金额/税额/数量）、舍入方式与舍入单位，
--      含税/未税换算与金额计算一律调用统一舍入规则。
-- 注意：
--   a) 业务字段一律不得命名为 version，避免与 BaseEntity 的乐观锁字段 version 冲突。
--   b) 各表主编码（currency_code/rate_no/tax_no/rule_no）支持人工指定，
--      且表上存在硬唯一索引；为与唯一索引保持一致，本模块删除语义为「释放编码」，
--      由服务层执行物理删除（与 G1-N1 及其后各节点同一处理方式）。

-- ========== 币种（T101） ==========

CREATE TABLE sys_currency (
    id                BIGINT       NOT NULL,
    currency_code     VARCHAR(16)  NOT NULL,
    currency_name     VARCHAR(128) NOT NULL,
    currency_symbol   VARCHAR(16),
    currency_precision INT         NOT NULL DEFAULT 2,
    base_flag         INT          NOT NULL DEFAULT 0,
    country           VARCHAR(64),
    currency_status   VARCHAR(32)  NOT NULL DEFAULT 'ACTIVE',
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
CREATE UNIQUE INDEX uk_sys_currency_code ON sys_currency (currency_code);
CREATE INDEX idx_sys_currency_status ON sys_currency (currency_status);

-- ========== 汇率（T101） ==========

CREATE TABLE sys_exchange_rate (
    id             BIGINT        NOT NULL,
    rate_no        VARCHAR(64)   NOT NULL,
    from_currency  VARCHAR(16)   NOT NULL,
    to_currency    VARCHAR(16)   NOT NULL,
    rate_type      VARCHAR(32)   NOT NULL DEFAULT 'SPOT',
    rate_value     DECIMAL(18, 8) NOT NULL DEFAULT 1,
    effective_date TIMESTAMP,
    expire_date    TIMESTAMP,
    rate_source    VARCHAR(128),
    rate_status    VARCHAR(32)   NOT NULL DEFAULT 'ACTIVE',
    org_id         BIGINT,
    org_name       VARCHAR(128),
    description    VARCHAR(1000),
    remark         VARCHAR(500),
    created_by     BIGINT,
    created_at     TIMESTAMP,
    updated_by     BIGINT,
    updated_at     TIMESTAMP,
    deleted        INT           NOT NULL DEFAULT 0,
    version        INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_sys_exchange_rate_no ON sys_exchange_rate (rate_no);
CREATE INDEX idx_sys_exchange_rate_pair ON sys_exchange_rate (from_currency, to_currency);
CREATE INDEX idx_sys_exchange_rate_status ON sys_exchange_rate (rate_status);

-- ========== 税率（T101） ==========

CREATE TABLE sys_tax_rate (
    id             BIGINT        NOT NULL,
    tax_no         VARCHAR(64)   NOT NULL,
    tax_code       VARCHAR(64),
    tax_name       VARCHAR(128)  NOT NULL,
    tax_type       VARCHAR(32)   NOT NULL DEFAULT 'VAT',
    tax_rate       DECIMAL(9, 4) NOT NULL DEFAULT 0,
    country        VARCHAR(64),
    effective_date TIMESTAMP,
    expire_date    TIMESTAMP,
    tax_status     VARCHAR(32)   NOT NULL DEFAULT 'ACTIVE',
    org_id         BIGINT,
    org_name       VARCHAR(128),
    description    VARCHAR(1000),
    remark         VARCHAR(500),
    created_by     BIGINT,
    created_at     TIMESTAMP,
    updated_by     BIGINT,
    updated_at     TIMESTAMP,
    deleted        INT           NOT NULL DEFAULT 0,
    version        INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_sys_tax_rate_no ON sys_tax_rate (tax_no);
CREATE INDEX idx_sys_tax_rate_code ON sys_tax_rate (tax_code);
CREATE INDEX idx_sys_tax_rate_status ON sys_tax_rate (tax_status);

-- ========== 含税/未税价格规则（T101） ==========

CREATE TABLE sys_price_rule (
    id               BIGINT       NOT NULL,
    rule_no          VARCHAR(64)  NOT NULL,
    rule_code        VARCHAR(64),
    rule_name        VARCHAR(128) NOT NULL,
    biz_module       VARCHAR(32),
    price_mode       VARCHAR(32)  NOT NULL DEFAULT 'TAX_EXCLUSIVE',
    tax_code         VARCHAR(64),
    rounding_mode    VARCHAR(32)  NOT NULL DEFAULT 'HALF_UP',
    precision_digits INT          NOT NULL DEFAULT 2,
    rule_status      VARCHAR(32)  NOT NULL DEFAULT 'ACTIVE',
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
CREATE UNIQUE INDEX uk_sys_price_rule_no ON sys_price_rule (rule_no);
CREATE INDEX idx_sys_price_rule_status ON sys_price_rule (rule_status);

-- ========== 舍入规则（T101） ==========

CREATE TABLE sys_rounding_rule (
    id               BIGINT         NOT NULL,
    rule_no          VARCHAR(64)    NOT NULL,
    rule_code        VARCHAR(64),
    rule_name        VARCHAR(128)   NOT NULL,
    rounding_target  VARCHAR(32)    NOT NULL DEFAULT 'AMOUNT',
    rounding_mode    VARCHAR(32)    NOT NULL DEFAULT 'HALF_UP',
    rounding_unit    DECIMAL(18, 6) NOT NULL DEFAULT 0.01,
    precision_digits INT            NOT NULL DEFAULT 2,
    rule_status      VARCHAR(32)    NOT NULL DEFAULT 'ACTIVE',
    org_id           BIGINT,
    org_name         VARCHAR(128),
    description      VARCHAR(1000),
    remark           VARCHAR(500),
    created_by       BIGINT,
    created_at       TIMESTAMP,
    updated_by       BIGINT,
    updated_at       TIMESTAMP,
    deleted          INT            NOT NULL DEFAULT 0,
    version          INT            NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_sys_rounding_rule_no ON sys_rounding_rule (rule_no);
CREATE INDEX idx_sys_rounding_rule_status ON sys_rounding_rule (rule_status);
