-- G4-N3 SRM—采购协同（WBS T033）表结构。
-- 主数据权责：SRM 为供应商与价格权威源；采购订单（po_no）引用 ERP 采购订单主数据。
-- 覆盖范围：订单确认、交期承诺、变更确认、送货预约、ASN 发货通知。

-- ========== 1. 订单确认（采购订单确认单） ==========

CREATE TABLE srm_po_confirmation (
    id               BIGINT        NOT NULL,
    confirm_no       VARCHAR(64)   NOT NULL,
    po_no            VARCHAR(64),
    supplier_code    VARCHAR(64),
    supplier_name    VARCHAR(200),
    material_code    VARCHAR(64),
    material_name    VARCHAR(200),
    spec             VARCHAR(255),
    po_qty           DECIMAL(18, 4),
    unit             VARCHAR(32),
    unit_price       DECIMAL(18, 4),
    total_amount     DECIMAL(18, 2),
    currency         VARCHAR(16)   NOT NULL DEFAULT 'CNY',
    po_date          DATE,
    require_date     DATE,
    confirm_by       VARCHAR(64),
    confirm_date     DATE,
    confirm_status   VARCHAR(32)   NOT NULL DEFAULT 'PENDING',
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
CREATE UNIQUE INDEX uk_srm_po_confirm_no ON srm_po_confirmation (confirm_no);
CREATE INDEX idx_srm_po_confirm_po ON srm_po_confirmation (po_no);
CREATE INDEX idx_srm_po_confirm_supplier ON srm_po_confirmation (supplier_code);
CREATE INDEX idx_srm_po_confirm_status ON srm_po_confirmation (confirm_status);

-- ========== 2. 交期承诺（供应商交期承诺） ==========

CREATE TABLE srm_delivery_commitment (
    id                 BIGINT        NOT NULL,
    commitment_no      VARCHAR(64)   NOT NULL,
    confirm_no         VARCHAR(64),
    po_no              VARCHAR(64),
    supplier_code      VARCHAR(64),
    supplier_name      VARCHAR(200),
    material_code      VARCHAR(64),
    material_name      VARCHAR(200),
    spec               VARCHAR(255),
    commitment_qty     DECIMAL(18, 4),
    unit               VARCHAR(32),
    require_date       DATE,
    promise_date       DATE,
    delay_days         INT,
    delay_reason       VARCHAR(500),
    commit_by          VARCHAR(64),
    commit_date        DATE,
    commitment_status  VARCHAR(32)   NOT NULL DEFAULT 'PENDING',
    org_id             BIGINT,
    org_name           VARCHAR(128),
    description        VARCHAR(1000),
    remark             VARCHAR(500),
    created_by         BIGINT,
    created_at         TIMESTAMP,
    updated_by         BIGINT,
    updated_at         TIMESTAMP,
    deleted            INT           NOT NULL DEFAULT 0,
    version            INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_srm_commitment_no ON srm_delivery_commitment (commitment_no);
CREATE INDEX idx_srm_commitment_po ON srm_delivery_commitment (po_no);
CREATE INDEX idx_srm_commitment_supplier ON srm_delivery_commitment (supplier_code);
CREATE INDEX idx_srm_commitment_status ON srm_delivery_commitment (commitment_status);

-- ========== 3. 变更确认（采购订单变更确认） ==========

CREATE TABLE srm_po_change (
    id             BIGINT        NOT NULL,
    change_no      VARCHAR(64)   NOT NULL,
    po_no          VARCHAR(64),
    supplier_code  VARCHAR(64),
    supplier_name  VARCHAR(200),
    material_code  VARCHAR(64),
    material_name  VARCHAR(200),
    spec           VARCHAR(255),
    change_type    VARCHAR(32)   NOT NULL DEFAULT 'QTY',
    before_qty     DECIMAL(18, 4),
    after_qty      DECIMAL(18, 4),
    before_date    DATE,
    after_date     DATE,
    before_price   DECIMAL(18, 4),
    after_price    DECIMAL(18, 4),
    change_reason  VARCHAR(500),
    apply_by       VARCHAR(64),
    apply_date     DATE,
    confirm_by     VARCHAR(64),
    confirm_date   DATE,
    change_status  VARCHAR(32)   NOT NULL DEFAULT 'PENDING',
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
CREATE UNIQUE INDEX uk_srm_po_change_no ON srm_po_change (change_no);
CREATE INDEX idx_srm_po_change_po ON srm_po_change (po_no);
CREATE INDEX idx_srm_po_change_supplier ON srm_po_change (supplier_code);
CREATE INDEX idx_srm_po_change_type ON srm_po_change (change_type);
CREATE INDEX idx_srm_po_change_status ON srm_po_change (change_status);

-- ========== 4. 送货预约 ==========

CREATE TABLE srm_delivery_appointment (
    id                  BIGINT        NOT NULL,
    appointment_no      VARCHAR(64)   NOT NULL,
    po_no               VARCHAR(64),
    supplier_code       VARCHAR(64),
    supplier_name       VARCHAR(200),
    material_code       VARCHAR(64),
    material_name       VARCHAR(200),
    spec                VARCHAR(255),
    appoint_qty         DECIMAL(18, 4),
    unit                VARCHAR(32),
    delivery_date       DATE,
    time_slot           VARCHAR(64),
    warehouse_code      VARCHAR(64),
    warehouse_name      VARCHAR(128),
    vehicle_no          VARCHAR(64),
    driver              VARCHAR(64),
    driver_phone        VARCHAR(32),
    appoint_by          VARCHAR(64),
    appoint_date        DATE,
    appointment_status  VARCHAR(32)   NOT NULL DEFAULT 'PENDING',
    org_id              BIGINT,
    org_name            VARCHAR(128),
    description         VARCHAR(1000),
    remark              VARCHAR(500),
    created_by          BIGINT,
    created_at          TIMESTAMP,
    updated_by          BIGINT,
    updated_at          TIMESTAMP,
    deleted             INT           NOT NULL DEFAULT 0,
    version             INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_srm_appointment_no ON srm_delivery_appointment (appointment_no);
CREATE INDEX idx_srm_appointment_po ON srm_delivery_appointment (po_no);
CREATE INDEX idx_srm_appointment_supplier ON srm_delivery_appointment (supplier_code);
CREATE INDEX idx_srm_appointment_status ON srm_delivery_appointment (appointment_status);
CREATE INDEX idx_srm_appointment_date ON srm_delivery_appointment (delivery_date);

-- ========== 5. ASN 发货通知 ==========

CREATE TABLE srm_asn (
    id                BIGINT        NOT NULL,
    asn_no            VARCHAR(64)   NOT NULL,
    appointment_no    VARCHAR(64),
    po_no             VARCHAR(64),
    supplier_code     VARCHAR(64),
    supplier_name     VARCHAR(200),
    material_code     VARCHAR(64),
    material_name     VARCHAR(200),
    spec              VARCHAR(255),
    ship_qty          DECIMAL(18, 4),
    unit              VARCHAR(32),
    ship_date         DATE,
    arrive_date       DATE,
    carrier           VARCHAR(128),
    tracking_no       VARCHAR(64),
    vehicle_no        VARCHAR(64),
    package_count     INT,
    asn_by            VARCHAR(64),
    asn_date          DATE,
    asn_status        VARCHAR(32)   NOT NULL DEFAULT 'DRAFT',
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
CREATE UNIQUE INDEX uk_srm_asn_no ON srm_asn (asn_no);
CREATE INDEX idx_srm_asn_appointment ON srm_asn (appointment_no);
CREATE INDEX idx_srm_asn_po ON srm_asn (po_no);
CREATE INDEX idx_srm_asn_supplier ON srm_asn (supplier_code);
CREATE INDEX idx_srm_asn_status ON srm_asn (asn_status);
