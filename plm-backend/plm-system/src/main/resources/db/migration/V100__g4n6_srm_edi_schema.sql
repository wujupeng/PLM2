-- G4-N6 SRM—EDI 协同（WBS T036）表结构。
-- 主数据权责：SRM 为供应商 EDI 协同权威源；供应商编码引用 SRM 供应商主数据，
-- 客户需求/预测/订单/变更引用 G4-N3 采购协同与 ERP 单据。
-- 覆盖范围：EDI 报文分发（需求/预测/订单/变更）、EDI 回执、EDI 对账。

-- ========== 1. EDI 报文（分发记录） ==========

CREATE TABLE srm_edi_message (
    id             BIGINT        NOT NULL,
    edi_no         VARCHAR(64)   NOT NULL,
    partner_code   VARCHAR(64),
    partner_name   VARCHAR(200),
    direction      VARCHAR(32)   NOT NULL DEFAULT 'OUTBOUND',
    message_type   VARCHAR(32)   NOT NULL DEFAULT 'ORDER',
    biz_no         VARCHAR(64),
    message_format VARCHAR(32)   NOT NULL DEFAULT 'XML',
    payload        VARCHAR(4000),
    send_time      TIMESTAMP,
    ack_status     VARCHAR(32)   NOT NULL DEFAULT 'DRAFT',
    ack_time       TIMESTAMP,
    ack_code       VARCHAR(64),
    retry_count    INT           NOT NULL DEFAULT 0,
    last_retry_time TIMESTAMP,
    next_retry_time TIMESTAMP,
    message_status VARCHAR(32)   NOT NULL DEFAULT 'DRAFT',
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
CREATE UNIQUE INDEX uk_srm_edi_message_no ON srm_edi_message (edi_no);
CREATE INDEX idx_srm_edi_message_partner ON srm_edi_message (partner_code);
CREATE INDEX idx_srm_edi_message_type ON srm_edi_message (message_type);
CREATE INDEX idx_srm_edi_message_biz ON srm_edi_message (biz_no);
CREATE INDEX idx_srm_edi_message_direction ON srm_edi_message (direction);
CREATE INDEX idx_srm_edi_message_status ON srm_edi_message (message_status);

-- ========== 2. EDI 回执 ==========

CREATE TABLE srm_edi_receipt (
    id             BIGINT        NOT NULL,
    receipt_no     VARCHAR(64)   NOT NULL,
    edi_no         VARCHAR(64),
    partner_code   VARCHAR(64),
    partner_name   VARCHAR(200),
    receipt_type   VARCHAR(32)   NOT NULL DEFAULT 'ACK',
    receipt_code   VARCHAR(64),
    receipt_desc   VARCHAR(1000),
    received_time  TIMESTAMP,
    receipt_status VARCHAR(32)   NOT NULL DEFAULT 'RECEIVED',
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
CREATE UNIQUE INDEX uk_srm_edi_receipt_no ON srm_edi_receipt (receipt_no);
CREATE INDEX idx_srm_edi_receipt_edi ON srm_edi_receipt (edi_no);
CREATE INDEX idx_srm_edi_receipt_partner ON srm_edi_receipt (partner_code);
CREATE INDEX idx_srm_edi_receipt_type ON srm_edi_receipt (receipt_type);
CREATE INDEX idx_srm_edi_receipt_status ON srm_edi_receipt (receipt_status);

-- ========== 3. EDI 对账 ==========

CREATE TABLE srm_edi_reconcile (
    id                BIGINT        NOT NULL,
    reconcile_no      VARCHAR(64)   NOT NULL,
    partner_code      VARCHAR(64),
    partner_name      VARCHAR(200),
    reconcile_period  VARCHAR(32),
    message_type      VARCHAR(32)   NOT NULL DEFAULT 'ORDER',
    send_count        INT           NOT NULL DEFAULT 0,
    ack_count         INT           NOT NULL DEFAULT 0,
    fail_count        INT           NOT NULL DEFAULT 0,
    reconcile_result  VARCHAR(1000),
    reconcile_date    DATE,
    reconcile_status  VARCHAR(32)   NOT NULL DEFAULT 'PENDING',
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
CREATE UNIQUE INDEX uk_srm_edi_reconcile_no ON srm_edi_reconcile (reconcile_no);
CREATE INDEX idx_srm_edi_reconcile_partner ON srm_edi_reconcile (partner_code);
CREATE INDEX idx_srm_edi_reconcile_period ON srm_edi_reconcile (reconcile_period);
CREATE INDEX idx_srm_edi_reconcile_type ON srm_edi_reconcile (message_type);
CREATE INDEX idx_srm_edi_reconcile_status ON srm_edi_reconcile (reconcile_status);
