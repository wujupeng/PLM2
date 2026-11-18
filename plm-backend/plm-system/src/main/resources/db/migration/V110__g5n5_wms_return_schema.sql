-- G5-N5 WMS—生产退补料（WBS T049）表结构。
-- 主数据权责：WMS 为库位、批次、实物库存、仓储作业与扫码流水的权威源；
-- 退料/补料单引用 ERP 生产工单与 PLM 物料主数据，批次与库位库存引用 G5-N3 库存控制，
-- 线边仓引用 G5-N4 拣选发料（线边仓库存）。
-- 覆盖范围：退料、补料、超领、余料回库、差异处理。

-- ========== 1. 生产退料单（退料 / 余料回库） ==========

CREATE TABLE wms_return_order (
    id             BIGINT        NOT NULL,
    return_no      VARCHAR(64)   NOT NULL,
    return_type    VARCHAR(32)   NOT NULL DEFAULT 'RETURN',
    work_order_no  VARCHAR(64),
    material_code  VARCHAR(64)   NOT NULL,
    material_name  VARCHAR(200),
    spec           VARCHAR(200),
    batch_no       VARCHAR(64),
    warehouse_code VARCHAR(64),
    bin_code       VARCHAR(64),
    return_qty     DECIMAL(18,4) NOT NULL DEFAULT 0,
    received_qty   DECIMAL(18,4) NOT NULL DEFAULT 0,
    return_reason  VARCHAR(500),
    return_status  VARCHAR(32)   NOT NULL DEFAULT 'DRAFT',
    apply_by       VARCHAR(64),
    apply_time     TIMESTAMP,
    receive_by     VARCHAR(64),
    receive_time   TIMESTAMP,
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
CREATE UNIQUE INDEX uk_wms_return_no ON wms_return_order (return_no);
CREATE INDEX idx_wms_return_type ON wms_return_order (return_type);
CREATE INDEX idx_wms_return_work_order ON wms_return_order (work_order_no);
CREATE INDEX idx_wms_return_material ON wms_return_order (material_code);
CREATE INDEX idx_wms_return_batch ON wms_return_order (batch_no);
CREATE INDEX idx_wms_return_status ON wms_return_order (return_status);

-- ========== 2. 生产补料单（补料 / 超领） ==========

CREATE TABLE wms_replenish_order (
    id              BIGINT        NOT NULL,
    replenish_no    VARCHAR(64)   NOT NULL,
    replenish_type  VARCHAR(32)   NOT NULL DEFAULT 'REPLENISH',
    work_order_no   VARCHAR(64),
    material_code   VARCHAR(64)   NOT NULL,
    material_name   VARCHAR(200),
    spec            VARCHAR(200),
    batch_no        VARCHAR(64),
    warehouse_code  VARCHAR(64),
    bin_code        VARCHAR(64),
    plan_qty        DECIMAL(18,4) NOT NULL DEFAULT 0,
    replenish_qty   DECIMAL(18,4) NOT NULL DEFAULT 0,
    issued_qty      DECIMAL(18,4) NOT NULL DEFAULT 0,
    replenish_reason VARCHAR(500),
    replenish_status VARCHAR(32)  NOT NULL DEFAULT 'DRAFT',
    apply_by        VARCHAR(64),
    apply_time      TIMESTAMP,
    issue_by        VARCHAR(64),
    issue_time      TIMESTAMP,
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
CREATE UNIQUE INDEX uk_wms_replenish_no ON wms_replenish_order (replenish_no);
CREATE INDEX idx_wms_replenish_type ON wms_replenish_order (replenish_type);
CREATE INDEX idx_wms_replenish_work_order ON wms_replenish_order (work_order_no);
CREATE INDEX idx_wms_replenish_material ON wms_replenish_order (material_code);
CREATE INDEX idx_wms_replenish_batch ON wms_replenish_order (batch_no);
CREATE INDEX idx_wms_replenish_status ON wms_replenish_order (replenish_status);

-- ========== 3. 退补料差异处理单 ==========

CREATE TABLE wms_material_diff (
    id             BIGINT        NOT NULL,
    diff_no        VARCHAR(64)   NOT NULL,
    diff_type      VARCHAR(32)   NOT NULL DEFAULT 'QTY',
    work_order_no  VARCHAR(64),
    material_code  VARCHAR(64)   NOT NULL,
    material_name  VARCHAR(200),
    spec           VARCHAR(200),
    batch_no       VARCHAR(64),
    warehouse_code VARCHAR(64),
    plan_qty       DECIMAL(18,4) NOT NULL DEFAULT 0,
    actual_qty     DECIMAL(18,4) NOT NULL DEFAULT 0,
    diff_qty       DECIMAL(18,4) NOT NULL DEFAULT 0,
    diff_reason    VARCHAR(500),
    diff_status    VARCHAR(32)   NOT NULL DEFAULT 'PENDING',
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
CREATE UNIQUE INDEX uk_wms_material_diff_no ON wms_material_diff (diff_no);
CREATE INDEX idx_wms_material_diff_type ON wms_material_diff (diff_type);
CREATE INDEX idx_wms_material_diff_work_order ON wms_material_diff (work_order_no);
CREATE INDEX idx_wms_material_diff_material ON wms_material_diff (material_code);
CREATE INDEX idx_wms_material_diff_batch ON wms_material_diff (batch_no);
CREATE INDEX idx_wms_material_diff_status ON wms_material_diff (diff_status);
