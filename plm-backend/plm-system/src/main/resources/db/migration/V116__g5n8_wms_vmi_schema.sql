-- G5-N8 WMS—VMI管理（WBS T052）表结构。
-- 主数据权责：WMS 为库位、批次、实物库存、仓储作业与扫码流水的权威源；
-- VMI 库位引用 G5-N1 仓库/库位主数据，扫码收发引用 G5-N3 库存控制的批次与库位库存；
-- 超容量预警依据 VMI 库位容量与托盘数阈值，支持多法人多工厂（org_id）。
-- 覆盖范围：库位容量、托盘数、扫码+/-、二维码定位、超容量预警。

-- ========== 1. VMI 库位（库位容量 / 托盘数 / 二维码定位） ==========

CREATE TABLE wms_vmi_bin (
    id              BIGINT        NOT NULL,
    vmi_bin_no      VARCHAR(64)   NOT NULL,
    bin_type        VARCHAR(32)   NOT NULL DEFAULT 'STORAGE',
    warehouse_code  VARCHAR(64),
    bin_code        VARCHAR(64),
    material_code   VARCHAR(64)   NOT NULL,
    material_name   VARCHAR(200),
    spec            VARCHAR(200),
    capacity_qty    DECIMAL(18,4) NOT NULL DEFAULT 0,
    pallet_qty      DECIMAL(18,4) NOT NULL DEFAULT 0,
    max_pallet_qty  DECIMAL(18,4) NOT NULL DEFAULT 0,
    qr_code         VARCHAR(200),
    bin_status      VARCHAR(32)   NOT NULL DEFAULT 'IDLE',
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
CREATE UNIQUE INDEX uk_wms_vmi_bin_no ON wms_vmi_bin (vmi_bin_no);
CREATE INDEX idx_wms_vmi_bin_type ON wms_vmi_bin (bin_type);
CREATE INDEX idx_wms_vmi_bin_warehouse ON wms_vmi_bin (warehouse_code);
CREATE INDEX idx_wms_vmi_bin_material ON wms_vmi_bin (material_code);
CREATE INDEX idx_wms_vmi_bin_status ON wms_vmi_bin (bin_status);

-- ========== 2. VMI 扫码收发（扫码 +/-） ==========

CREATE TABLE wms_vmi_scan (
    id             BIGINT        NOT NULL,
    scan_no        VARCHAR(64)   NOT NULL,
    scan_type      VARCHAR(32)   NOT NULL DEFAULT 'IN',
    warehouse_code VARCHAR(64),
    bin_code       VARCHAR(64),
    material_code  VARCHAR(64)   NOT NULL,
    material_name  VARCHAR(200),
    spec           VARCHAR(200),
    batch_no       VARCHAR(64),
    pallet_no      VARCHAR(64),
    scan_qty       DECIMAL(18,4) NOT NULL DEFAULT 0,
    on_hand_qty    DECIMAL(18,4) NOT NULL DEFAULT 0,
    scan_status    VARCHAR(32)   NOT NULL DEFAULT 'DRAFT',
    operator       VARCHAR(64),
    scan_time      TIMESTAMP,
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
CREATE UNIQUE INDEX uk_wms_vmi_scan_no ON wms_vmi_scan (scan_no);
CREATE INDEX idx_wms_vmi_scan_type ON wms_vmi_scan (scan_type);
CREATE INDEX idx_wms_vmi_scan_warehouse ON wms_vmi_scan (warehouse_code);
CREATE INDEX idx_wms_vmi_scan_material ON wms_vmi_scan (material_code);
CREATE INDEX idx_wms_vmi_scan_batch ON wms_vmi_scan (batch_no);
CREATE INDEX idx_wms_vmi_scan_status ON wms_vmi_scan (scan_status);

-- ========== 3. VMI 超容量预警 ==========

CREATE TABLE wms_vmi_warning (
    id             BIGINT        NOT NULL,
    warning_no     VARCHAR(64)   NOT NULL,
    warehouse_code VARCHAR(64),
    bin_code       VARCHAR(64),
    material_code  VARCHAR(64)   NOT NULL,
    material_name  VARCHAR(200),
    spec           VARCHAR(200),
    capacity_qty   DECIMAL(18,4) NOT NULL DEFAULT 0,
    current_qty    DECIMAL(18,4) NOT NULL DEFAULT 0,
    usage_rate     DECIMAL(9,4)  NOT NULL DEFAULT 0,
    warning_level  VARCHAR(32)   NOT NULL DEFAULT 'MEDIUM',
    warning_status VARCHAR(32)   NOT NULL DEFAULT 'PENDING',
    warning_time   TIMESTAMP,
    handler        VARCHAR(64),
    handle_time    TIMESTAMP,
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
CREATE UNIQUE INDEX uk_wms_vmi_warning_no ON wms_vmi_warning (warning_no);
CREATE INDEX idx_wms_vmi_warning_warehouse ON wms_vmi_warning (warehouse_code);
CREATE INDEX idx_wms_vmi_warning_material ON wms_vmi_warning (material_code);
CREATE INDEX idx_wms_vmi_warning_level ON wms_vmi_warning (warning_level);
CREATE INDEX idx_wms_vmi_warning_status ON wms_vmi_warning (warning_status);
