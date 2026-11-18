-- G5-N6 WMS—成品与发运（WBS T050）表结构。
-- 主数据权责：WMS 为库位、批次、实物库存、仓储作业与扫码流水的权威源；
-- 成品入库单引用 ERP 生产工单与 PLM 物料主数据，批次与库位库存引用 G5-N3 库存控制，
-- 出库波次引用 G5-N4 拣选发料（拣料单），发运单引用 ERP 销售订单/发货通知与客户主数据。
-- 覆盖范围：完工入库、包装、标签、波次拣货、出库复核、装车。

-- ========== 1. 成品入库单（完工入库 / 包装 / 标签） ==========

CREATE TABLE wms_finished_goods (
    id             BIGINT        NOT NULL,
    fg_no          VARCHAR(64)   NOT NULL,
    fg_type        VARCHAR(32)   NOT NULL DEFAULT 'FINISHED',
    work_order_no  VARCHAR(64),
    material_code  VARCHAR(64)   NOT NULL,
    material_name  VARCHAR(200),
    spec           VARCHAR(200),
    batch_no       VARCHAR(64),
    warehouse_code VARCHAR(64),
    bin_code       VARCHAR(64),
    plan_qty       DECIMAL(18,4) NOT NULL DEFAULT 0,
    inbound_qty    DECIMAL(18,4) NOT NULL DEFAULT 0,
    package_no     VARCHAR(64),
    package_type   VARCHAR(32),
    label_no       VARCHAR(64),
    fg_status      VARCHAR(32)   NOT NULL DEFAULT 'DRAFT',
    produce_by     VARCHAR(64),
    produce_time   TIMESTAMP,
    inbound_by     VARCHAR(64),
    inbound_time   TIMESTAMP,
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
CREATE UNIQUE INDEX uk_wms_finished_goods_no ON wms_finished_goods (fg_no);
CREATE INDEX idx_wms_finished_goods_type ON wms_finished_goods (fg_type);
CREATE INDEX idx_wms_finished_goods_work_order ON wms_finished_goods (work_order_no);
CREATE INDEX idx_wms_finished_goods_material ON wms_finished_goods (material_code);
CREATE INDEX idx_wms_finished_goods_batch ON wms_finished_goods (batch_no);
CREATE INDEX idx_wms_finished_goods_status ON wms_finished_goods (fg_status);

-- ========== 2. 出库波次单（波次拣货 / 出库复核） ==========

CREATE TABLE wms_outbound_wave (
    id             BIGINT        NOT NULL,
    wave_no        VARCHAR(64)   NOT NULL,
    wave_type      VARCHAR(32)   NOT NULL DEFAULT 'WAVE',
    work_order_no  VARCHAR(64),
    material_code  VARCHAR(64)   NOT NULL,
    material_name  VARCHAR(200),
    spec           VARCHAR(200),
    batch_no       VARCHAR(64),
    warehouse_code VARCHAR(64),
    bin_code       VARCHAR(64),
    plan_qty       DECIMAL(18,4) NOT NULL DEFAULT 0,
    picked_qty     DECIMAL(18,4) NOT NULL DEFAULT 0,
    checked_qty    DECIMAL(18,4) NOT NULL DEFAULT 0,
    wave_status    VARCHAR(32)   NOT NULL DEFAULT 'DRAFT',
    pick_by        VARCHAR(64),
    pick_time      TIMESTAMP,
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
CREATE UNIQUE INDEX uk_wms_outbound_wave_no ON wms_outbound_wave (wave_no);
CREATE INDEX idx_wms_outbound_wave_type ON wms_outbound_wave (wave_type);
CREATE INDEX idx_wms_outbound_wave_work_order ON wms_outbound_wave (work_order_no);
CREATE INDEX idx_wms_outbound_wave_material ON wms_outbound_wave (material_code);
CREATE INDEX idx_wms_outbound_wave_status ON wms_outbound_wave (wave_status);

-- ========== 3. 发运单（装车 / 发运） ==========

CREATE TABLE wms_shipment_order (
    id               BIGINT        NOT NULL,
    shipment_no      VARCHAR(64)   NOT NULL,
    shipment_type    VARCHAR(32)   NOT NULL DEFAULT 'SALES',
    customer_code    VARCHAR(64),
    customer_name    VARCHAR(200),
    material_code    VARCHAR(64)   NOT NULL,
    material_name    VARCHAR(200),
    spec             VARCHAR(200),
    batch_no         VARCHAR(64),
    warehouse_code   VARCHAR(64),
    plan_qty         DECIMAL(18,4) NOT NULL DEFAULT 0,
    shipped_qty      DECIMAL(18,4) NOT NULL DEFAULT 0,
    carrier          VARCHAR(128),
    vehicle_no       VARCHAR(64),
    driver_name      VARCHAR(64),
    driver_phone     VARCHAR(32),
    delivery_address VARCHAR(500),
    shipment_status  VARCHAR(32)   NOT NULL DEFAULT 'DRAFT',
    load_by          VARCHAR(64),
    load_time        TIMESTAMP,
    ship_by          VARCHAR(64),
    ship_time        TIMESTAMP,
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
CREATE UNIQUE INDEX uk_wms_shipment_no ON wms_shipment_order (shipment_no);
CREATE INDEX idx_wms_shipment_type ON wms_shipment_order (shipment_type);
CREATE INDEX idx_wms_shipment_customer ON wms_shipment_order (customer_code);
CREATE INDEX idx_wms_shipment_status ON wms_shipment_order (shipment_status);
CREATE INDEX idx_wms_shipment_carrier ON wms_shipment_order (carrier);
