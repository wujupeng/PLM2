-- G5-N3 WMS—库存控制（WBS T047）表结构。
-- 主数据权责：WMS 为库位、批次、实物库存、仓储作业与扫码流水的权威源；
-- 库存批次/序列号引用 G5-N2 收货上架（收货单/ASN）与 PLM 物料主数据，库位引用 G5-N1 仓库基础。
-- 覆盖范围：批次/序列号、库位库存、冻结/解冻、效期、库存状态。

-- ========== 1. 库存批次（物料+批次+库位级实物库存） ==========

CREATE TABLE wms_inventory_batch (
    id              BIGINT        NOT NULL,
    batch_no        VARCHAR(64)   NOT NULL,
    material_code   VARCHAR(64)   NOT NULL,
    material_name   VARCHAR(200),
    spec            VARCHAR(200),
    warehouse_code  VARCHAR(64),
    zone_code       VARCHAR(64),
    bin_code        VARCHAR(64),
    supplier_code   VARCHAR(64),
    receipt_no      VARCHAR(64),
    batch_source    VARCHAR(32)   NOT NULL DEFAULT 'PURCHASE',
    production_date DATE,
    expiry_date     DATE,
    inbound_date    DATE,
    qty             DECIMAL(18,4) NOT NULL DEFAULT 0,
    available_qty   DECIMAL(18,4) NOT NULL DEFAULT 0,
    frozen_qty      DECIMAL(18,4) NOT NULL DEFAULT 0,
    batch_status    VARCHAR(32)   NOT NULL DEFAULT 'NORMAL',
    org_id          BIGINT,
    org_name        VARCHAR(128),
    description     VARCHAR(1000),
    remark          VARCHAR(500),
    created_by      BIGINT,
    created_at      TIMESTAMP,
    updated_by      BIGINT,
    updated_at      TIMESTAMP,
    deleted         INT           NOT NULL DEFAULT 0,
    version         INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE INDEX idx_wms_inv_batch_no ON wms_inventory_batch (batch_no);
CREATE INDEX idx_wms_inv_batch_material ON wms_inventory_batch (material_code);
CREATE INDEX idx_wms_inv_batch_bin ON wms_inventory_batch (bin_code);
CREATE INDEX idx_wms_inv_batch_status ON wms_inventory_batch (batch_status);
CREATE INDEX idx_wms_inv_batch_expiry ON wms_inventory_batch (expiry_date);
CREATE INDEX idx_wms_inv_batch_warehouse ON wms_inventory_batch (warehouse_code);

-- ========== 2. 序列号 ==========

CREATE TABLE wms_serial_number (
    id             BIGINT        NOT NULL,
    serial_no      VARCHAR(64)   NOT NULL,
    material_code  VARCHAR(64)   NOT NULL,
    material_name  VARCHAR(200),
    spec           VARCHAR(200),
    batch_no       VARCHAR(64),
    warehouse_code VARCHAR(64),
    bin_code       VARCHAR(64),
    supplier_code  VARCHAR(64),
    receipt_no     VARCHAR(64),
    inbound_time   TIMESTAMP,
    customer_code  VARCHAR(64),
    outbound_time  TIMESTAMP,
    serial_status  VARCHAR(32)   NOT NULL DEFAULT 'IN_STOCK',
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
CREATE UNIQUE INDEX uk_wms_serial_no ON wms_serial_number (serial_no);
CREATE INDEX idx_wms_serial_material ON wms_serial_number (material_code);
CREATE INDEX idx_wms_serial_batch ON wms_serial_number (batch_no);
CREATE INDEX idx_wms_serial_status ON wms_serial_number (serial_status);
CREATE INDEX idx_wms_serial_bin ON wms_serial_number (bin_code);
CREATE INDEX idx_wms_serial_warehouse ON wms_serial_number (warehouse_code);

-- ========== 3. 库存冻结单（冻结/解冻） ==========

CREATE TABLE wms_stock_freeze (
    id             BIGINT        NOT NULL,
    freeze_no      VARCHAR(64)   NOT NULL,
    material_code  VARCHAR(64)   NOT NULL,
    material_name  VARCHAR(200),
    batch_no       VARCHAR(64),
    warehouse_code VARCHAR(64),
    bin_code       VARCHAR(64),
    freeze_qty     DECIMAL(18,4) NOT NULL DEFAULT 0,
    freeze_type    VARCHAR(32)   NOT NULL DEFAULT 'FREEZE',
    freeze_reason  VARCHAR(500),
    freeze_status  VARCHAR(32)   NOT NULL DEFAULT 'FROZEN',
    apply_by       VARCHAR(64),
    apply_time     TIMESTAMP,
    release_by     VARCHAR(64),
    release_time   TIMESTAMP,
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
CREATE UNIQUE INDEX uk_wms_freeze_no ON wms_stock_freeze (freeze_no);
CREATE INDEX idx_wms_freeze_material ON wms_stock_freeze (material_code);
CREATE INDEX idx_wms_freeze_batch ON wms_stock_freeze (batch_no);
CREATE INDEX idx_wms_freeze_status ON wms_stock_freeze (freeze_status);
CREATE INDEX idx_wms_freeze_bin ON wms_stock_freeze (bin_code);
CREATE INDEX idx_wms_freeze_warehouse ON wms_stock_freeze (warehouse_code);
