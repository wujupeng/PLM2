-- G4-N2 SRM—寻源与询报价（WBS T032）表结构。
-- 主数据权责：SRM 为供应商与价格权威源；物料编码引用 PLM 物料主数据（material_code 关联）。
-- 覆盖范围：采购需求寻源、RFQ 询价、询价邀请、供应商报价、报价比价、定点定标、定点定价协议。

-- ========== 1. 采购需求寻源（寻源需求单） ==========

CREATE TABLE srm_sourcing_request (
    id               BIGINT        NOT NULL,
    sourcing_no      VARCHAR(64)   NOT NULL,
    sourcing_title   VARCHAR(200),
    material_code    VARCHAR(64),
    material_name    VARCHAR(200),
    spec             VARCHAR(255),
    demand_qty       DECIMAL(18, 4),
    unit             VARCHAR(32),
    demand_date      DATE,
    demand_dept      VARCHAR(128),
    applicant        VARCHAR(64),
    sourcing_type    VARCHAR(32)   NOT NULL DEFAULT 'RFQ',
    budget_amount    DECIMAL(18, 2),
    currency         VARCHAR(16)   NOT NULL DEFAULT 'CNY',
    sourcing_status  VARCHAR(32)   NOT NULL DEFAULT 'DRAFT',
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
CREATE UNIQUE INDEX uk_srm_sourcing_no ON srm_sourcing_request (sourcing_no);
CREATE INDEX idx_srm_sourcing_type ON srm_sourcing_request (sourcing_type);
CREATE INDEX idx_srm_sourcing_status ON srm_sourcing_request (sourcing_status);
CREATE INDEX idx_srm_sourcing_material ON srm_sourcing_request (material_code);

-- ========== 2. 询价单（RFQ） ==========

CREATE TABLE srm_rfq (
    id             BIGINT        NOT NULL,
    rfq_no         VARCHAR(64)   NOT NULL,
    rfq_title      VARCHAR(200),
    sourcing_no    VARCHAR(64),
    rfq_type       VARCHAR(32)   NOT NULL DEFAULT 'INVITED',
    material_code  VARCHAR(64),
    material_name  VARCHAR(200),
    spec           VARCHAR(255),
    rfq_qty        DECIMAL(18, 4),
    unit           VARCHAR(32),
    publish_date   DATE,
    deadline_date  DATE,
    invite_count   INT,
    quote_count    INT,
    buyer          VARCHAR(64),
    rfq_status     VARCHAR(32)   NOT NULL DEFAULT 'DRAFT',
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
CREATE UNIQUE INDEX uk_srm_rfq_no ON srm_rfq (rfq_no);
CREATE INDEX idx_srm_rfq_type ON srm_rfq (rfq_type);
CREATE INDEX idx_srm_rfq_status ON srm_rfq (rfq_status);
CREATE INDEX idx_srm_rfq_sourcing ON srm_rfq (sourcing_no);

-- ========== 3. 询价邀请供应商 ==========

CREATE TABLE srm_rfq_supplier (
    id             BIGINT        NOT NULL,
    invite_no      VARCHAR(64)   NOT NULL,
    rfq_no         VARCHAR(64),
    supplier_code  VARCHAR(64),
    supplier_name  VARCHAR(200),
    contact        VARCHAR(64),
    phone          VARCHAR(32),
    email          VARCHAR(128),
    invite_date    DATE,
    respond_date   DATE,
    invite_status  VARCHAR(32)   NOT NULL DEFAULT 'INVITED',
    decline_reason VARCHAR(500),
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
CREATE UNIQUE INDEX uk_srm_rfq_supplier_no ON srm_rfq_supplier (invite_no);
CREATE INDEX idx_srm_rfq_supplier_rfq ON srm_rfq_supplier (rfq_no);
CREATE INDEX idx_srm_rfq_supplier_code ON srm_rfq_supplier (supplier_code);
CREATE INDEX idx_srm_rfq_supplier_status ON srm_rfq_supplier (invite_status);

-- ========== 4. 供应商报价 ==========

CREATE TABLE srm_supplier_quote (
    id             BIGINT        NOT NULL,
    quote_no       VARCHAR(64)   NOT NULL,
    rfq_no         VARCHAR(64),
    supplier_code  VARCHAR(64),
    supplier_name  VARCHAR(200),
    material_code  VARCHAR(64),
    material_name  VARCHAR(200),
    spec           VARCHAR(255),
    quote_qty      DECIMAL(18, 4),
    unit           VARCHAR(32),
    unit_price     DECIMAL(18, 4),
    tax_rate       DECIMAL(10, 2),
    total_amount   DECIMAL(18, 2),
    currency       VARCHAR(16)   NOT NULL DEFAULT 'CNY',
    delivery_days  INT,
    payment_term   VARCHAR(128),
    quote_date     DATE,
    valid_until    DATE,
    quote_status   VARCHAR(32)   NOT NULL DEFAULT 'DRAFT',
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
CREATE UNIQUE INDEX uk_srm_supplier_quote_no ON srm_supplier_quote (quote_no);
CREATE INDEX idx_srm_supplier_quote_rfq ON srm_supplier_quote (rfq_no);
CREATE INDEX idx_srm_supplier_quote_supplier ON srm_supplier_quote (supplier_code);
CREATE INDEX idx_srm_supplier_quote_status ON srm_supplier_quote (quote_status);
CREATE INDEX idx_srm_supplier_quote_material ON srm_supplier_quote (material_code);

-- ========== 5. 报价比价 ==========

CREATE TABLE srm_price_compare (
    id                       BIGINT        NOT NULL,
    compare_no               VARCHAR(64)   NOT NULL,
    rfq_no                   VARCHAR(64),
    compare_title            VARCHAR(200),
    supplier_count           INT,
    lowest_price             DECIMAL(18, 4),
    highest_price            DECIMAL(18, 4),
    avg_price                DECIMAL(18, 4),
    recommend_supplier_code  VARCHAR(64),
    recommend_supplier_name  VARCHAR(200),
    compare_rule             VARCHAR(32)   NOT NULL DEFAULT 'LOWEST_PRICE',
    compare_conclusion       VARCHAR(1000),
    compare_by               VARCHAR(64),
    compare_date             DATE,
    compare_status           VARCHAR(32)   NOT NULL DEFAULT 'DRAFT',
    org_id                   BIGINT,
    org_name                 VARCHAR(128),
    description              VARCHAR(1000),
    remark                   VARCHAR(500),
    created_by               BIGINT,
    created_at               TIMESTAMP,
    updated_by               BIGINT,
    updated_at               TIMESTAMP,
    deleted                  INT           NOT NULL DEFAULT 0,
    version                  INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_srm_price_compare_no ON srm_price_compare (compare_no);
CREATE INDEX idx_srm_price_compare_rfq ON srm_price_compare (rfq_no);
CREATE INDEX idx_srm_price_compare_status ON srm_price_compare (compare_status);

-- ========== 6. 定点定标 ==========

CREATE TABLE srm_award (
    id             BIGINT        NOT NULL,
    award_no       VARCHAR(64)   NOT NULL,
    rfq_no         VARCHAR(64),
    compare_no     VARCHAR(64),
    material_code  VARCHAR(64),
    material_name  VARCHAR(200),
    spec           VARCHAR(255),
    award_type     VARCHAR(32)   NOT NULL DEFAULT 'SINGLE',
    supplier_code  VARCHAR(64),
    supplier_name  VARCHAR(200),
    award_qty      DECIMAL(18, 4),
    unit           VARCHAR(32),
    award_price    DECIMAL(18, 4),
    award_amount   DECIMAL(18, 2),
    currency       VARCHAR(16)   NOT NULL DEFAULT 'CNY',
    award_date     DATE,
    award_by       VARCHAR(64),
    approver       VARCHAR(64),
    approve_date   DATE,
    award_status   VARCHAR(32)   NOT NULL DEFAULT 'DRAFT',
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
CREATE UNIQUE INDEX uk_srm_award_no ON srm_award (award_no);
CREATE INDEX idx_srm_award_rfq ON srm_award (rfq_no);
CREATE INDEX idx_srm_award_supplier ON srm_award (supplier_code);
CREATE INDEX idx_srm_award_status ON srm_award (award_status);
CREATE INDEX idx_srm_award_type ON srm_award (award_type);

-- ========== 7. 定点定价协议 ==========

CREATE TABLE srm_price_agreement (
    id                BIGINT        NOT NULL,
    agreement_no      VARCHAR(64)   NOT NULL,
    supplier_code     VARCHAR(64),
    supplier_name     VARCHAR(200),
    material_code     VARCHAR(64),
    material_name     VARCHAR(200),
    spec              VARCHAR(255),
    price_type        VARCHAR(32)   NOT NULL DEFAULT 'AGREEMENT',
    unit              VARCHAR(32),
    unit_price        DECIMAL(18, 4),
    currency          VARCHAR(16)   NOT NULL DEFAULT 'CNY',
    tax_rate          DECIMAL(10, 2),
    moq               DECIMAL(18, 4),
    lead_time_days    INT,
    effective_date    DATE,
    expire_date       DATE,
    agreement_status  VARCHAR(32)   NOT NULL DEFAULT 'DRAFT',
    org_id            BIGINT,
    org_name          VARCHAR(128),
    description       VARCHAR(1000),
    remark            VARCHAR(500),
    created_by        BIGINT,
    created_at        TIMESTAMP,
    updated_by        BIGINT,
    updated_at        TIMESTAMP,
    deleted           INT           NOT NULL DEFAULT 0,
    version           INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_srm_price_agreement_no ON srm_price_agreement (agreement_no);
CREATE INDEX idx_srm_price_agreement_supplier ON srm_price_agreement (supplier_code);
CREATE INDEX idx_srm_price_agreement_material ON srm_price_agreement (material_code);
CREATE INDEX idx_srm_price_agreement_status ON srm_price_agreement (agreement_status);
CREATE INDEX idx_srm_price_agreement_type ON srm_price_agreement (price_type);
