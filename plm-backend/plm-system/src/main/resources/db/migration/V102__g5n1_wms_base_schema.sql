-- G5-N1 WMS—仓库基础（WBS T045）表结构。
-- 主数据权责：WMS 为库位、批次、实物库存、仓储作业与扫码流水的权威源。
-- 本节点覆盖：仓库、库区、库位（储位）、货架、容器、作业策略六类基础主数据。
-- 说明：既有 V13/V14（n7 物料供应与看板）为旧版轻量模块，本节点为 G5 全新自研仓储基础，
--       表名与旧表不冲突（旧表：wms_storage_location/wms_material_batch/wms_kanban 等）。

-- ========== 1. 仓库 ==========

CREATE TABLE wms_warehouse (
    id               BIGINT        NOT NULL,
    warehouse_code   VARCHAR(64)   NOT NULL,
    warehouse_name   VARCHAR(200),
    warehouse_type   VARCHAR(32)   NOT NULL DEFAULT 'FINISHED',
    address          VARCHAR(500),
    manager          VARCHAR(64),
    contact_phone    VARCHAR(32),
    area             DECIMAL(18,4),
    warehouse_status VARCHAR(32)   NOT NULL DEFAULT 'DRAFT',
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
CREATE UNIQUE INDEX uk_wms_warehouse_code ON wms_warehouse (warehouse_code);
CREATE INDEX idx_wms_warehouse_type ON wms_warehouse (warehouse_type);
CREATE INDEX idx_wms_warehouse_status ON wms_warehouse (warehouse_status);
CREATE INDEX idx_wms_warehouse_org ON wms_warehouse (org_id);

-- ========== 2. 库区 ==========

CREATE TABLE wms_zone (
    id             BIGINT        NOT NULL,
    zone_code      VARCHAR(64)   NOT NULL,
    zone_name      VARCHAR(200),
    warehouse_code VARCHAR(64),
    warehouse_name VARCHAR(200),
    zone_type      VARCHAR(32)   NOT NULL DEFAULT 'STORAGE',
    temperature_type VARCHAR(32) NOT NULL DEFAULT 'NORMAL',
    zone_status    VARCHAR(32)   NOT NULL DEFAULT 'DRAFT',
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
CREATE UNIQUE INDEX uk_wms_zone_code ON wms_zone (zone_code);
CREATE INDEX idx_wms_zone_warehouse ON wms_zone (warehouse_code);
CREATE INDEX idx_wms_zone_type ON wms_zone (zone_type);
CREATE INDEX idx_wms_zone_status ON wms_zone (zone_status);

-- ========== 3. 库位（储位） ==========

CREATE TABLE wms_bin (
    id             BIGINT        NOT NULL,
    bin_code       VARCHAR(64)   NOT NULL,
    bin_name       VARCHAR(200),
    warehouse_code VARCHAR(64),
    zone_code      VARCHAR(64),
    bin_type       VARCHAR(32)   NOT NULL DEFAULT 'STORAGE',
    max_capacity   DECIMAL(18,4),
    used_capacity  DECIMAL(18,4) NOT NULL DEFAULT 0,
    capacity_unit  VARCHAR(32),
    barcode        VARCHAR(128),
    bin_status     VARCHAR(32)   NOT NULL DEFAULT 'IDLE',
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
CREATE UNIQUE INDEX uk_wms_bin_code ON wms_bin (bin_code);
CREATE INDEX idx_wms_bin_warehouse ON wms_bin (warehouse_code);
CREATE INDEX idx_wms_bin_zone ON wms_bin (zone_code);
CREATE INDEX idx_wms_bin_type ON wms_bin (bin_type);
CREATE INDEX idx_wms_bin_status ON wms_bin (bin_status);

-- ========== 4. 货架 ==========

CREATE TABLE wms_rack (
    id             BIGINT        NOT NULL,
    rack_code      VARCHAR(64)   NOT NULL,
    rack_name      VARCHAR(200),
    warehouse_code VARCHAR(64),
    zone_code      VARCHAR(64),
    rack_type      VARCHAR(32)   NOT NULL DEFAULT 'SHELF',
    layer_count    INT           NOT NULL DEFAULT 0,
    bin_count      INT           NOT NULL DEFAULT 0,
    max_load       DECIMAL(18,4),
    barcode        VARCHAR(128),
    rack_status    VARCHAR(32)   NOT NULL DEFAULT 'DRAFT',
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
CREATE UNIQUE INDEX uk_wms_rack_code ON wms_rack (rack_code);
CREATE INDEX idx_wms_rack_warehouse ON wms_rack (warehouse_code);
CREATE INDEX idx_wms_rack_zone ON wms_rack (zone_code);
CREATE INDEX idx_wms_rack_status ON wms_rack (rack_status);

-- ========== 5. 容器 ==========

CREATE TABLE wms_container (
    id              BIGINT        NOT NULL,
    container_code  VARCHAR(64)   NOT NULL,
    container_name  VARCHAR(200),
    container_type  VARCHAR(32)   NOT NULL DEFAULT 'PALLET',
    capacity        DECIMAL(18,4),
    capacity_unit   VARCHAR(32),
    current_bin_code VARCHAR(64),
    barcode         VARCHAR(128),
    container_status VARCHAR(32)  NOT NULL DEFAULT 'IDLE',
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
CREATE UNIQUE INDEX uk_wms_container_code ON wms_container (container_code);
CREATE INDEX idx_wms_container_type ON wms_container (container_type);
CREATE INDEX idx_wms_container_bin ON wms_container (current_bin_code);
CREATE INDEX idx_wms_container_status ON wms_container (container_status);

-- ========== 6. 作业策略 ==========

CREATE TABLE wms_strategy (
    id              BIGINT        NOT NULL,
    strategy_code   VARCHAR(64)   NOT NULL,
    strategy_name   VARCHAR(200),
    strategy_type   VARCHAR(32)   NOT NULL DEFAULT 'PUTAWAY',
    priority        INT           NOT NULL DEFAULT 0,
    fifo_flag       INT           NOT NULL DEFAULT 0,
    rule_content    VARCHAR(1000),
    strategy_status VARCHAR(32)   NOT NULL DEFAULT 'DRAFT',
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
CREATE UNIQUE INDEX uk_wms_strategy_code ON wms_strategy (strategy_code);
CREATE INDEX idx_wms_strategy_type ON wms_strategy (strategy_type);
CREATE INDEX idx_wms_strategy_status ON wms_strategy (strategy_status);
CREATE INDEX idx_wms_strategy_priority ON wms_strategy (priority);
