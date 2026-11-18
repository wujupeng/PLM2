-- G5-N2 WMS—收货上架（WBS T046）表结构。
-- 主数据权责：WMS 为库位、批次、实物库存、仓储作业与扫码流水的权威源；
-- ASN/收货单引用 SRM 供应商主数据与采购/委外单据，上架任务引用 G5-N1 仓库基础（库位/作业策略）。
-- 覆盖范围：采购/委外 ASN、扫码收货、待检区、质检放行、上架任务。

-- ========== 1. 收货通知单（ASN） ==========

CREATE TABLE wms_asn (
    id                    BIGINT        NOT NULL,
    asn_no                VARCHAR(64)   NOT NULL,
    asn_type              VARCHAR(32)   NOT NULL DEFAULT 'PURCHASE',
    supplier_code         VARCHAR(64),
    supplier_name         VARCHAR(200),
    po_no                 VARCHAR(64),
    expected_arrival_date DATE,
    carrier               VARCHAR(128),
    warehouse_code        VARCHAR(64),
    total_qty             DECIMAL(18,4) NOT NULL DEFAULT 0,
    received_qty          DECIMAL(18,4) NOT NULL DEFAULT 0,
    asn_status            VARCHAR(32)   NOT NULL DEFAULT 'DRAFT',
    org_id                BIGINT,
    org_name              VARCHAR(128),
    description           VARCHAR(1000),
    remark                VARCHAR(500),
    created_by            BIGINT,
    created_at            TIMESTAMP,
    updated_by            BIGINT,
    updated_at            TIMESTAMP,
    deleted               INT           NOT NULL DEFAULT 0,
    version               INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_wms_asn_no ON wms_asn (asn_no);
CREATE INDEX idx_wms_asn_type ON wms_asn (asn_type);
CREATE INDEX idx_wms_asn_supplier ON wms_asn (supplier_code);
CREATE INDEX idx_wms_asn_po ON wms_asn (po_no);
CREATE INDEX idx_wms_asn_status ON wms_asn (asn_status);
CREATE INDEX idx_wms_asn_warehouse ON wms_asn (warehouse_code);

-- ========== 2. 收货单 ==========

CREATE TABLE wms_receipt (
    id             BIGINT        NOT NULL,
    receipt_no     VARCHAR(64)   NOT NULL,
    asn_no         VARCHAR(64),
    supplier_code  VARCHAR(64),
    supplier_name  VARCHAR(200),
    warehouse_code VARCHAR(64),
    receive_type   VARCHAR(32)   NOT NULL DEFAULT 'SCAN',
    receive_time   TIMESTAMP,
    operator       VARCHAR(64),
    total_qty      DECIMAL(18,4) NOT NULL DEFAULT 0,
    inspected_qty  DECIMAL(18,4) NOT NULL DEFAULT 0,
    qualified_qty  DECIMAL(18,4) NOT NULL DEFAULT 0,
    rejected_qty   DECIMAL(18,4) NOT NULL DEFAULT 0,
    receive_status VARCHAR(32)   NOT NULL DEFAULT 'PENDING',
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
CREATE UNIQUE INDEX uk_wms_receipt_no ON wms_receipt (receipt_no);
CREATE INDEX idx_wms_receipt_asn ON wms_receipt (asn_no);
CREATE INDEX idx_wms_receipt_supplier ON wms_receipt (supplier_code);
CREATE INDEX idx_wms_receipt_type ON wms_receipt (receive_type);
CREATE INDEX idx_wms_receipt_status ON wms_receipt (receive_status);
CREATE INDEX idx_wms_receipt_warehouse ON wms_receipt (warehouse_code);

-- ========== 3. 上架任务 ==========

CREATE TABLE wms_putaway_task (
    id             BIGINT        NOT NULL,
    task_no        VARCHAR(64)   NOT NULL,
    receipt_no     VARCHAR(64),
    material_code  VARCHAR(64),
    material_name  VARCHAR(200),
    batch_no       VARCHAR(64),
    qty            DECIMAL(18,4) NOT NULL DEFAULT 0,
    from_bin_code  VARCHAR(64),
    to_bin_code    VARCHAR(64),
    strategy_code  VARCHAR(64),
    operator       VARCHAR(64),
    putaway_time   TIMESTAMP,
    task_priority  INT           NOT NULL DEFAULT 0,
    putaway_status VARCHAR(32)   NOT NULL DEFAULT 'PENDING',
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
CREATE UNIQUE INDEX uk_wms_putaway_task_no ON wms_putaway_task (task_no);
CREATE INDEX idx_wms_putaway_receipt ON wms_putaway_task (receipt_no);
CREATE INDEX idx_wms_putaway_material ON wms_putaway_task (material_code);
CREATE INDEX idx_wms_putaway_batch ON wms_putaway_task (batch_no);
CREATE INDEX idx_wms_putaway_to_bin ON wms_putaway_task (to_bin_code);
CREATE INDEX idx_wms_putaway_status ON wms_putaway_task (putaway_status);
