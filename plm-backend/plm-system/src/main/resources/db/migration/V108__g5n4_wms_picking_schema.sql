-- G5-N4 WMS—拣选发料（WBS T048）表结构。
-- 主数据权责：WMS 为库位、批次、实物库存、仓储作业与扫码流水的权威源；
-- 拣料单引用 ERP 生产工单与 PLM 物料主数据，库位/线边仓引用 G5-N1 仓库基础，
-- 批次与库位库存引用 G5-N3 库存控制（先进先出按批次效期/入库时间）。
-- 覆盖范围：生产领料、齐套检查、先进先出、按工单配送、线边仓。

-- ========== 1. 拣料单（生产领料 / 按工单配送） ==========

CREATE TABLE wms_pick_task (
    id             BIGINT        NOT NULL,
    pick_no        VARCHAR(64)   NOT NULL,
    pick_type      VARCHAR(32)   NOT NULL DEFAULT 'PRODUCTION',
    work_order_no  VARCHAR(64),
    material_code  VARCHAR(64)   NOT NULL,
    material_name  VARCHAR(200),
    spec           VARCHAR(200),
    batch_no       VARCHAR(64),
    warehouse_code VARCHAR(64),
    from_bin_code  VARCHAR(64),
    to_bin_code    VARCHAR(64),
    required_qty   DECIMAL(18,4) NOT NULL DEFAULT 0,
    picked_qty     DECIMAL(18,4) NOT NULL DEFAULT 0,
    pick_strategy  VARCHAR(32)   NOT NULL DEFAULT 'FIFO',
    task_priority  INT           NOT NULL DEFAULT 0,
    operator       VARCHAR(64),
    pick_time      TIMESTAMP,
    pick_status    VARCHAR(32)   NOT NULL DEFAULT 'PENDING',
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
CREATE UNIQUE INDEX uk_wms_picktask_no ON wms_pick_task (pick_no);
CREATE INDEX idx_wms_picktask_type ON wms_pick_task (pick_type);
CREATE INDEX idx_wms_picktask_work_order ON wms_pick_task (work_order_no);
CREATE INDEX idx_wms_picktask_material ON wms_pick_task (material_code);
CREATE INDEX idx_wms_picktask_batch ON wms_pick_task (batch_no);
CREATE INDEX idx_wms_picktask_status ON wms_pick_task (pick_status);

-- ========== 2. 齐套检查 ==========

CREATE TABLE wms_kitting_check (
    id             BIGINT        NOT NULL,
    check_no       VARCHAR(64)   NOT NULL,
    work_order_no  VARCHAR(64)   NOT NULL,
    product_code   VARCHAR(64),
    product_name   VARCHAR(200),
    plan_qty       DECIMAL(18,4) NOT NULL DEFAULT 0,
    total_items    INT           NOT NULL DEFAULT 0,
    kit_items      INT           NOT NULL DEFAULT 0,
    short_items    INT           NOT NULL DEFAULT 0,
    short_qty      DECIMAL(18,4) NOT NULL DEFAULT 0,
    kit_status     VARCHAR(32)   NOT NULL DEFAULT 'PENDING',
    check_by       VARCHAR(64),
    check_time     TIMESTAMP,
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
CREATE UNIQUE INDEX uk_wms_kitting_no ON wms_kitting_check (check_no);
CREATE INDEX idx_wms_kitting_work_order ON wms_kitting_check (work_order_no);
CREATE INDEX idx_wms_kitting_product ON wms_kitting_check (product_code);
CREATE INDEX idx_wms_kitting_status ON wms_kitting_check (kit_status);

-- ========== 3. 线边仓库存 ==========

CREATE TABLE wms_line_side_inventory (
    id             BIGINT        NOT NULL,
    material_code  VARCHAR(64)   NOT NULL,
    material_name  VARCHAR(200),
    spec           VARCHAR(200),
    batch_no       VARCHAR(64),
    line_code      VARCHAR(64),
    bin_code       VARCHAR(64),
    warehouse_code VARCHAR(64),
    qty            DECIMAL(18,4) NOT NULL DEFAULT 0,
    available_qty  DECIMAL(18,4) NOT NULL DEFAULT 0,
    frozen_qty     DECIMAL(18,4) NOT NULL DEFAULT 0,
    min_qty        DECIMAL(18,4) NOT NULL DEFAULT 0,
    max_qty        DECIMAL(18,4) NOT NULL DEFAULT 0,
    stock_status   VARCHAR(32)   NOT NULL DEFAULT 'NORMAL',
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
CREATE INDEX idx_wms_linestock_material ON wms_line_side_inventory (material_code);
CREATE INDEX idx_wms_linestock_line ON wms_line_side_inventory (line_code);
CREATE INDEX idx_wms_linestock_batch ON wms_line_side_inventory (batch_no);
CREATE INDEX idx_wms_linestock_status ON wms_line_side_inventory (stock_status);
CREATE INDEX idx_wms_linestock_warehouse ON wms_line_side_inventory (warehouse_code);
