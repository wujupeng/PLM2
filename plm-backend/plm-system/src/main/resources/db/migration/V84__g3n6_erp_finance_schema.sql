-- G3-N6 ERP—财务（对应总任务书 WBS T028 财务业务接口，属 G3 ERP，按决策「全部自研」扩展为完整财务核算）。
-- 说明：SQL 同时兼容 PostgreSQL 与 H2（PostgreSQL 兼容模式），主键由应用侧雪花算法生成。
-- 设计原则：
--   1) 业务范围（T028）：应收应付、采购/销售发票、暂估、成本归集、总账；并按决策「全部自研（含总账/税务/发票/银行直连）」，
--      本节点实现内置总账核算（会计科目、会计期间、记账凭证）、往来核算（应收/应付/收付款/核销）、
--      发票台账（含增值税要素）、银行对账（银行流水与余额调节基础）、成本归集与暂估。
--   2) 主数据权责约束（见《主数据权责》表）：
--      客户/销售关系权威源为 ERP，供应商档案/准入权威源为 SRM，物料权威源为 PLM，
--      本模块以编码引用客户/供应商/物料；销售发票（erp_sales_invoice）、采购发票（erp_purchase_invoice）、
--      销售应收（erp_sales_receivable）、采购结算（erp_purchase_settlement）等业务侧单据由既有节点维护，
--      本节点以单号引用，不重复建表。
--   3) 平台公共能力复用（不重复建表）：币种（sys_currency）、税率（sys_tax_rate）、汇率（sys_exchange_rate）、
--      法人主体（sys_legal_entity）、工厂（sys_factory）、组织（sys_organization）、单据状态机（sys_doc_state_*）、
--      审批（oa_process_*）由 G1 平台底座提供，ERP 财务侧按编码引用；凭证状态、核算状态等业务语义字段在本模块内维护。
--   4) 单据编号规则：*_no 支持人工指定，未指定时由服务层按统一前缀自动生成；
--      财务核算链：会计科目（erp_finance_account）→ 会计期间（erp_finance_period）
--      → 记账凭证（erp_finance_voucher/_line）→ 应收单（erp_finance_receivable）/应付单（erp_finance_payable）
--      → 收付款单（erp_finance_payment）→ 核销单（erp_finance_writeoff）
--      → 发票登记（erp_finance_invoice）→ 银行对账（erp_finance_bank_statement）
--      → 成本归集（erp_finance_cost_collection）→ 暂估（erp_finance_accrual）。
-- 注意：
--   a) 业务字段一律不得命名为 version，避免与 BaseEntity 的乐观锁字段 version 冲突。
--   b) 具备业务编码唯一索引的单据表删除语义为「释放编码」，由服务层执行物理删除；
--      凭证明细行无业务编码唯一索引，随头删除时逻辑删除即可。
--   c) 多法人多工厂：各单据以 org_id/org_name 归属组织（法人/工厂），跨组织结算规则待业务方确认。

-- ========== T028 ERP 会计科目（总账基础） ==========

CREATE TABLE erp_finance_account (
    id                BIGINT         NOT NULL,
    account_code      VARCHAR(64)    NOT NULL,
    account_name      VARCHAR(200),
    account_type      VARCHAR(32)    NOT NULL DEFAULT 'ASSET',
    balance_direction VARCHAR(16)    NOT NULL DEFAULT 'DEBIT',
    parent_code       VARCHAR(64),
    level_no          INT            NOT NULL DEFAULT 1,
    is_leaf           INT            NOT NULL DEFAULT 1,
    currency_code     VARCHAR(16)    NOT NULL DEFAULT 'CNY',
    account_status    VARCHAR(32)    NOT NULL DEFAULT 'ACTIVE',
    org_id            BIGINT,
    org_name          VARCHAR(128),
    description       VARCHAR(1000),
    remark            VARCHAR(500),
    created_by        BIGINT,
    created_at        TIMESTAMP,
    updated_by        BIGINT,
    updated_at        TIMESTAMP,
    deleted           INT            NOT NULL DEFAULT 0,
    version           INT            NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_erp_finance_account_code ON erp_finance_account (account_code);
CREATE INDEX idx_erp_finance_account_type ON erp_finance_account (account_type);

-- ========== T028 ERP 会计期间（期间管理/期末结账基础） ==========

CREATE TABLE erp_finance_period (
    id            BIGINT         NOT NULL,
    period_code   VARCHAR(32)    NOT NULL,
    period_year   INT,
    period_month  INT,
    start_date    DATE,
    end_date      DATE,
    period_status VARCHAR(32)    NOT NULL DEFAULT 'OPEN',
    closed_at     TIMESTAMP,
    org_id        BIGINT,
    org_name      VARCHAR(128),
    description   VARCHAR(1000),
    remark        VARCHAR(500),
    created_by    BIGINT,
    created_at    TIMESTAMP,
    updated_by    BIGINT,
    updated_at    TIMESTAMP,
    deleted       INT            NOT NULL DEFAULT 0,
    version       INT            NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_erp_finance_period_code ON erp_finance_period (period_code);

-- ========== T028 ERP 记账凭证（总账凭证头） ==========

CREATE TABLE erp_finance_voucher (
    id               BIGINT         NOT NULL,
    voucher_no       VARCHAR(64)    NOT NULL,
    voucher_word     VARCHAR(16)    NOT NULL DEFAULT '记',
    period_code      VARCHAR(32),
    voucher_date     DATE,
    biz_type         VARCHAR(32)    NOT NULL DEFAULT 'MANUAL',
    source_no        VARCHAR(64),
    total_debit      DECIMAL(18, 2) NOT NULL DEFAULT 0,
    total_credit     DECIMAL(18, 2) NOT NULL DEFAULT 0,
    attachment_count INT            NOT NULL DEFAULT 0,
    voucher_status   VARCHAR(32)    NOT NULL DEFAULT 'DRAFT',
    summary          VARCHAR(500),
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
CREATE UNIQUE INDEX uk_erp_finance_voucher_no ON erp_finance_voucher (voucher_no);
CREATE INDEX idx_erp_finance_voucher_period ON erp_finance_voucher (period_code);

-- ========== T028 ERP 记账凭证分录（总账凭证明细） ==========

CREATE TABLE erp_finance_voucher_line (
    id             BIGINT         NOT NULL,
    voucher_id     BIGINT         NOT NULL,
    line_no        INT,
    account_code   VARCHAR(64),
    account_name   VARCHAR(200),
    summary        VARCHAR(500),
    debit_amount   DECIMAL(18, 2) NOT NULL DEFAULT 0,
    credit_amount  DECIMAL(18, 2) NOT NULL DEFAULT 0,
    currency_code  VARCHAR(16)    NOT NULL DEFAULT 'CNY',
    exchange_rate  DECIMAL(18, 6) NOT NULL DEFAULT 1,
    dept_code      VARCHAR(64),
    project_code   VARCHAR(64),
    material_code  VARCHAR(64),
    org_id         BIGINT,
    org_name       VARCHAR(128),
    description    VARCHAR(1000),
    remark         VARCHAR(500),
    created_by     BIGINT,
    created_at     TIMESTAMP,
    updated_by     BIGINT,
    updated_at     TIMESTAMP,
    deleted        INT            NOT NULL DEFAULT 0,
    version        INT            NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE INDEX idx_erp_finance_voucher_line_voucher ON erp_finance_voucher_line (voucher_id);

-- ========== T028 ERP 应收单（往来核算—应收） ==========

CREATE TABLE erp_finance_receivable (
    id             BIGINT         NOT NULL,
    ar_no          VARCHAR(64)    NOT NULL,
    customer_code  VARCHAR(64),
    customer_name  VARCHAR(200),
    invoice_no     VARCHAR(64),
    source_no      VARCHAR(64),
    ar_amount      DECIMAL(18, 2) NOT NULL DEFAULT 0,
    settled_amount DECIMAL(18, 2) NOT NULL DEFAULT 0,
    ar_balance     DECIMAL(18, 2) NOT NULL DEFAULT 0,
    currency_code  VARCHAR(16)    NOT NULL DEFAULT 'CNY',
    ar_date        DATE,
    due_date       DATE,
    ar_status      VARCHAR(32)    NOT NULL DEFAULT 'OPEN',
    org_id         BIGINT,
    org_name       VARCHAR(128),
    description    VARCHAR(1000),
    remark         VARCHAR(500),
    created_by     BIGINT,
    created_at     TIMESTAMP,
    updated_by     BIGINT,
    updated_at     TIMESTAMP,
    deleted        INT            NOT NULL DEFAULT 0,
    version        INT            NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_erp_finance_receivable_no ON erp_finance_receivable (ar_no);
CREATE INDEX idx_erp_finance_receivable_customer ON erp_finance_receivable (customer_code);

-- ========== T028 ERP 应付单（往来核算—应付） ==========

CREATE TABLE erp_finance_payable (
    id             BIGINT         NOT NULL,
    ap_no          VARCHAR(64)    NOT NULL,
    supplier_code  VARCHAR(64),
    supplier_name  VARCHAR(200),
    invoice_no     VARCHAR(64),
    source_no      VARCHAR(64),
    ap_amount      DECIMAL(18, 2) NOT NULL DEFAULT 0,
    settled_amount DECIMAL(18, 2) NOT NULL DEFAULT 0,
    ap_balance     DECIMAL(18, 2) NOT NULL DEFAULT 0,
    currency_code  VARCHAR(16)    NOT NULL DEFAULT 'CNY',
    ap_date        DATE,
    due_date       DATE,
    ap_status      VARCHAR(32)    NOT NULL DEFAULT 'OPEN',
    org_id         BIGINT,
    org_name       VARCHAR(128),
    description    VARCHAR(1000),
    remark         VARCHAR(500),
    created_by     BIGINT,
    created_at     TIMESTAMP,
    updated_by     BIGINT,
    updated_at     TIMESTAMP,
    deleted        INT            NOT NULL DEFAULT 0,
    version        INT            NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_erp_finance_payable_no ON erp_finance_payable (ap_no);
CREATE INDEX idx_erp_finance_payable_supplier ON erp_finance_payable (supplier_code);

-- ========== T028 ERP 收付款单（往来核算—收付款） ==========

CREATE TABLE erp_finance_payment (
    id             BIGINT         NOT NULL,
    payment_no     VARCHAR(64)    NOT NULL,
    payment_type   VARCHAR(32)    NOT NULL DEFAULT 'RECEIPT',
    party_type     VARCHAR(32)    NOT NULL DEFAULT 'CUSTOMER',
    party_code     VARCHAR(64),
    party_name     VARCHAR(200),
    bank_account   VARCHAR(64),
    bank_name      VARCHAR(200),
    payment_method VARCHAR(32)    NOT NULL DEFAULT 'TRANSFER',
    amount         DECIMAL(18, 2) NOT NULL DEFAULT 0,
    currency_code  VARCHAR(16)    NOT NULL DEFAULT 'CNY',
    payment_date   DATE,
    source_no      VARCHAR(64),
    payment_status VARCHAR(32)    NOT NULL DEFAULT 'DRAFT',
    org_id         BIGINT,
    org_name       VARCHAR(128),
    description    VARCHAR(1000),
    remark         VARCHAR(500),
    created_by     BIGINT,
    created_at     TIMESTAMP,
    updated_by     BIGINT,
    updated_at     TIMESTAMP,
    deleted        INT            NOT NULL DEFAULT 0,
    version        INT            NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_erp_finance_payment_no ON erp_finance_payment (payment_no);
CREATE INDEX idx_erp_finance_payment_party ON erp_finance_payment (party_code);

-- ========== T028 ERP 核销单（应收应付核销） ==========

CREATE TABLE erp_finance_writeoff (
    id              BIGINT         NOT NULL,
    writeoff_no     VARCHAR(64)    NOT NULL,
    writeoff_type   VARCHAR(32)    NOT NULL DEFAULT 'AR',
    party_code      VARCHAR(64),
    party_name      VARCHAR(200),
    source_no       VARCHAR(64),
    target_no       VARCHAR(64),
    writeoff_amount DECIMAL(18, 2) NOT NULL DEFAULT 0,
    currency_code   VARCHAR(16)    NOT NULL DEFAULT 'CNY',
    writeoff_date   DATE,
    writeoff_status VARCHAR(32)    NOT NULL DEFAULT 'DRAFT',
    org_id          BIGINT,
    org_name        VARCHAR(128),
    description     VARCHAR(1000),
    remark          VARCHAR(500),
    created_by      BIGINT,
    created_at      TIMESTAMP,
    updated_by      BIGINT,
    updated_at      TIMESTAMP,
    deleted         INT            NOT NULL DEFAULT 0,
    version         INT            NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_erp_finance_writeoff_no ON erp_finance_writeoff (writeoff_no);
CREATE INDEX idx_erp_finance_writeoff_party ON erp_finance_writeoff (party_code);

-- ========== T028 ERP 发票登记（采购/销售发票台账，含增值税要素） ==========

CREATE TABLE erp_finance_invoice (
    id             BIGINT         NOT NULL,
    invoice_no     VARCHAR(64)    NOT NULL,
    invoice_code   VARCHAR(64),
    invoice_type   VARCHAR(32)    NOT NULL DEFAULT 'VAT_SPECIAL',
    direction      VARCHAR(16)    NOT NULL DEFAULT 'OUT',
    party_type     VARCHAR(32)    NOT NULL DEFAULT 'CUSTOMER',
    party_code     VARCHAR(64),
    party_name     VARCHAR(200),
    source_no      VARCHAR(64),
    amount         DECIMAL(18, 2) NOT NULL DEFAULT 0,
    tax_rate       DECIMAL(9, 4)  NOT NULL DEFAULT 0,
    tax_amount     DECIMAL(18, 2) NOT NULL DEFAULT 0,
    total_amount   DECIMAL(18, 2) NOT NULL DEFAULT 0,
    currency_code  VARCHAR(16)    NOT NULL DEFAULT 'CNY',
    invoice_date   DATE,
    verify_status  VARCHAR(32)    NOT NULL DEFAULT 'UNVERIFIED',
    invoice_status VARCHAR(32)    NOT NULL DEFAULT 'DRAFT',
    org_id         BIGINT,
    org_name       VARCHAR(128),
    description    VARCHAR(1000),
    remark         VARCHAR(500),
    created_by     BIGINT,
    created_at     TIMESTAMP,
    updated_by     BIGINT,
    updated_at     TIMESTAMP,
    deleted        INT            NOT NULL DEFAULT 0,
    version        INT            NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_erp_finance_invoice_no ON erp_finance_invoice (invoice_no);
CREATE INDEX idx_erp_finance_invoice_party ON erp_finance_invoice (party_code);

-- ========== T028 ERP 银行对账单（银行直连流水/余额调节基础） ==========

CREATE TABLE erp_finance_bank_statement (
    id                 BIGINT         NOT NULL,
    statement_no       VARCHAR(64)    NOT NULL,
    bank_account       VARCHAR(64),
    bank_name          VARCHAR(200),
    transaction_no     VARCHAR(64),
    transaction_date   DATE,
    direction          VARCHAR(16)    NOT NULL DEFAULT 'IN',
    amount             DECIMAL(18, 2) NOT NULL DEFAULT 0,
    balance            DECIMAL(18, 2) NOT NULL DEFAULT 0,
    counterparty_name  VARCHAR(200),
    counterparty_account VARCHAR(64),
    currency_code      VARCHAR(16)    NOT NULL DEFAULT 'CNY',
    match_status       VARCHAR(32)    NOT NULL DEFAULT 'UNMATCHED',
    statement_status   VARCHAR(32)    NOT NULL DEFAULT 'IMPORTED',
    org_id             BIGINT,
    org_name           VARCHAR(128),
    description        VARCHAR(1000),
    remark             VARCHAR(500),
    created_by         BIGINT,
    created_at         TIMESTAMP,
    updated_by         BIGINT,
    updated_at         TIMESTAMP,
    deleted            INT            NOT NULL DEFAULT 0,
    version            INT            NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_erp_finance_bank_statement_no ON erp_finance_bank_statement (statement_no);
CREATE INDEX idx_erp_finance_bank_statement_account ON erp_finance_bank_statement (bank_account);

-- ========== T028 ERP 成本归集（成本要素归集） ==========

CREATE TABLE erp_finance_cost_collection (
    id                BIGINT         NOT NULL,
    collection_no     VARCHAR(64)    NOT NULL,
    period_code       VARCHAR(32),
    object_type       VARCHAR(32)    NOT NULL DEFAULT 'PRODUCT',
    object_code       VARCHAR(64),
    object_name       VARCHAR(200),
    cost_element      VARCHAR(32)    NOT NULL DEFAULT 'MATERIAL',
    amount            DECIMAL(18, 2) NOT NULL DEFAULT 0,
    currency_code     VARCHAR(16)    NOT NULL DEFAULT 'CNY',
    collection_date   DATE,
    collection_status VARCHAR(32)    NOT NULL DEFAULT 'DRAFT',
    org_id            BIGINT,
    org_name          VARCHAR(128),
    description       VARCHAR(1000),
    remark            VARCHAR(500),
    created_by        BIGINT,
    created_at        TIMESTAMP,
    updated_by        BIGINT,
    updated_at        TIMESTAMP,
    deleted           INT            NOT NULL DEFAULT 0,
    version           INT            NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_erp_finance_cost_collection_no ON erp_finance_cost_collection (collection_no);
CREATE INDEX idx_erp_finance_cost_collection_object ON erp_finance_cost_collection (object_code);

-- ========== T028 ERP 暂估（暂估应付/暂估应收） ==========

CREATE TABLE erp_finance_accrual (
    id             BIGINT         NOT NULL,
    accrual_no     VARCHAR(64)    NOT NULL,
    accrual_type   VARCHAR(32)    NOT NULL DEFAULT 'AP',
    party_code     VARCHAR(64),
    party_name     VARCHAR(200),
    source_no      VARCHAR(64),
    period_code    VARCHAR(32),
    amount         DECIMAL(18, 2) NOT NULL DEFAULT 0,
    tax_amount     DECIMAL(18, 2) NOT NULL DEFAULT 0,
    currency_code  VARCHAR(16)    NOT NULL DEFAULT 'CNY',
    accrual_date   DATE,
    reversed       INT            NOT NULL DEFAULT 0,
    accrual_status VARCHAR(32)    NOT NULL DEFAULT 'DRAFT',
    org_id         BIGINT,
    org_name       VARCHAR(128),
    description    VARCHAR(1000),
    remark         VARCHAR(500),
    created_by     BIGINT,
    created_at     TIMESTAMP,
    updated_by     BIGINT,
    updated_at     TIMESTAMP,
    deleted        INT            NOT NULL DEFAULT 0,
    version        INT            NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_erp_finance_accrual_no ON erp_finance_accrual (accrual_no);
CREATE INDEX idx_erp_finance_accrual_party ON erp_finance_accrual (party_code);
