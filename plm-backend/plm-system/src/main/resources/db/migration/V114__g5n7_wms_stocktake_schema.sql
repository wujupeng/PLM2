-- G5-N7 WMS—盘点与调拨（WBS T051）表结构。
-- 主数据权责：WMS 为库位、批次、实物库存、仓储作业与扫码流水的权威源；
-- 盘点单引用 G5-N3 库存控制的批次与库位库存快照，差异审批后回写实物库存；
-- 调拨单引用 G5-N1 仓库/库位主数据，跨仓调拨引用 G5-N3 库存控制与组织（多法人多工厂）。
-- 覆盖范围：循环盘点、全盘、差异审批、仓间调拨。

-- ========== 1. 盘点单（循环盘点 / 全盘） ==========

CREATE TABLE wms_stocktake_order (
    id              BIGINT        NOT NULL,
    stocktake_no    VARCHAR(64)   NOT NULL,
    stocktake_type  VARCHAR(32)   NOT NULL DEFAULT 'CYCLE',
    warehouse_code  VARCHAR(64),
    bin_code        VARCHAR(64),
    material_code   VARCHAR(64)   NOT NULL,
    material_name   VARCHAR(200),
    spec            VARCHAR(200),
    batch_no        VARCHAR(64),
    book_qty        DECIMAL(18,4) NOT NULL DEFAULT 0,
    counted_qty     DECIMAL(18,4) NOT NULL DEFAULT 0,
    diff_qty        DECIMAL(18,4) NOT NULL DEFAULT 0,
    stocktake_status VARCHAR(32)  NOT NULL DEFAULT 'DRAFT',
    count_by        VARCHAR(64),
    count_time      TIMESTAMP,
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
CREATE UNIQUE INDEX uk_wms_stocktake_no ON wms_stocktake_order (stocktake_no);
CREATE INDEX idx_wms_stocktake_type ON wms_stocktake_order (stocktake_type);
CREATE INDEX idx_wms_stocktake_warehouse ON wms_stocktake_order (warehouse_code);
CREATE INDEX idx_wms_stocktake_material ON wms_stocktake_order (material_code);
CREATE INDEX idx_wms_stocktake_status ON wms_stocktake_order (stocktake_status);

-- ========== 2. 盘点差异单（差异审批） ==========

CREATE TABLE wms_stocktake_diff (
    id             BIGINT        NOT NULL,
    diff_no        VARCHAR(64)   NOT NULL,
    stocktake_no   VARCHAR(64),
    diff_type      VARCHAR(32)   NOT NULL DEFAULT 'PROFIT',
    material_code  VARCHAR(64)   NOT NULL,
    material_name  VARCHAR(200),
    spec           VARCHAR(200),
    batch_no       VARCHAR(64),
    warehouse_code VARCHAR(64),
    book_qty       DECIMAL(18,4) NOT NULL DEFAULT 0,
    counted_qty    DECIMAL(18,4) NOT NULL DEFAULT 0,
    diff_qty       DECIMAL(18,4) NOT NULL DEFAULT 0,
    diff_reason    VARCHAR(500),
    diff_status    VARCHAR(32)   NOT NULL DEFAULT 'PENDING',
    approve_by     VARCHAR(64),
    approve_time   TIMESTAMP,
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
CREATE UNIQUE INDEX uk_wms_stocktake_diff_no ON wms_stocktake_diff (diff_no);
CREATE INDEX idx_wms_stocktake_diff_type ON wms_stocktake_diff (diff_type);
CREATE INDEX idx_wms_stocktake_diff_material ON wms_stocktake_diff (material_code);
CREATE INDEX idx_wms_stocktake_diff_status ON wms_stocktake_diff (diff_status);

-- ========== 3. 调拨单（仓间调拨） ==========

CREATE TABLE wms_transfer_order (
    id                  BIGINT        NOT NULL,
    transfer_no         VARCHAR(64)   NOT NULL,
    transfer_type       VARCHAR(32)   NOT NULL DEFAULT 'WAREHOUSE',
    material_code       VARCHAR(64)   NOT NULL,
    material_name       VARCHAR(200),
    spec                VARCHAR(200),
    batch_no            VARCHAR(64),
    from_warehouse_code VARCHAR(64),
    from_bin_code       VARCHAR(64),
    to_warehouse_code   VARCHAR(64),
    to_bin_code         VARCHAR(64),
    transfer_qty        DECIMAL(18,4) NOT NULL DEFAULT 0,
    received_qty        DECIMAL(18,4) NOT NULL DEFAULT 0,
    transfer_status     VARCHAR(32)   NOT NULL DEFAULT 'DRAFT',
    apply_by            VARCHAR(64),
    apply_time          TIMESTAMP,
    transfer_by         VARCHAR(64),
    transfer_time       TIMESTAMP,
    receive_by          VARCHAR(64),
    receive_time        TIMESTAMP,
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
CREATE UNIQUE INDEX uk_wms_transfer_no ON wms_transfer_order (transfer_no);
CREATE INDEX idx_wms_transfer_type ON wms_transfer_order (transfer_type);
CREATE INDEX idx_wms_transfer_material ON wms_transfer_order (material_code);
CREATE INDEX idx_wms_transfer_from ON wms_transfer_order (from_warehouse_code);
CREATE INDEX idx_wms_transfer_to ON wms_transfer_order (to_warehouse_code);
CREATE INDEX idx_wms_transfer_status ON wms_transfer_order (transfer_status);
