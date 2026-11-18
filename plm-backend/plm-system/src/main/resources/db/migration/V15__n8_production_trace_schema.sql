-- N8 生产执行与发货追溯：生产批次档案、工序过站与采集、关键参数与测试结果、单件/批次追溯码绑定、
-- 包装规则与箱码、出货订单匹配、出货扫码防错、发货放行与 ASN、全流程正反向追溯、召回与批次隔离
-- 说明：SQL 同时兼容 PostgreSQL 与 H2（PostgreSQL 兼容模式），主键由应用侧雪花算法生成。

-- ========== DEV-085 生产批次档案 ==========

CREATE TABLE mfg_production_batch (
    id               BIGINT        NOT NULL,
    batch_no         VARCHAR(64)   NOT NULL,
    work_order_no    VARCHAR(64),
    product_code     VARCHAR(64)   NOT NULL,
    product_name     VARCHAR(128),
    product_version  VARCHAR(64),
    bom_version      VARCHAR(64),
    process_version  VARCHAR(64),
    production_date  DATE,
    shift_code       VARCHAR(32),
    line_code        VARCHAR(64),
    work_station     VARCHAR(64),
    planned_qty      DECIMAL(18, 4),
    completed_qty    DECIMAL(18, 4) NOT NULL DEFAULT 0,
    scrap_qty        DECIMAL(18, 4) NOT NULL DEFAULT 0,
    batch_status     VARCHAR(16)   NOT NULL DEFAULT 'PLANNED',
    release_status   VARCHAR(16)   NOT NULL DEFAULT 'UNRELEASED',
    source_system    VARCHAR(32),
    remark           VARCHAR(255),
    created_by       BIGINT,
    created_at       TIMESTAMP,
    updated_by       BIGINT,
    updated_at       TIMESTAMP,
    deleted          INT           NOT NULL DEFAULT 0,
    version          INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_mfg_batch_no ON mfg_production_batch (batch_no);
CREATE INDEX idx_mfg_batch_work_order ON mfg_production_batch (work_order_no);
CREATE INDEX idx_mfg_batch_product ON mfg_production_batch (product_code);
CREATE INDEX idx_mfg_batch_status ON mfg_production_batch (batch_status);
CREATE INDEX idx_mfg_batch_date ON mfg_production_batch (production_date);

-- ========== DEV-086 工序过站与采集 ==========

CREATE TABLE mfg_operation_record (
    id               BIGINT        NOT NULL,
    record_no        VARCHAR(64)   NOT NULL,
    batch_no         VARCHAR(64)   NOT NULL,
    work_order_no    VARCHAR(64),
    product_code     VARCHAR(64),
    serial_no        VARCHAR(64),
    operation_code   VARCHAR(64),
    operation_name   VARCHAR(128),
    seq_no           INT,
    work_station     VARCHAR(64),
    line_code        VARCHAR(64),
    equipment_code   VARCHAR(64),
    operator         VARCHAR(64),
    start_time       TIMESTAMP,
    end_time         TIMESTAMP,
    in_qty           DECIMAL(18, 4),
    out_qty          DECIMAL(18, 4),
    scrap_qty        DECIMAL(18, 4) NOT NULL DEFAULT 0,
    result           VARCHAR(16)   NOT NULL DEFAULT 'OK',
    source_system    VARCHAR(32),
    collect_time     TIMESTAMP,
    interface_status VARCHAR(16)   NOT NULL DEFAULT 'RECEIVED',
    remark           VARCHAR(255),
    created_by       BIGINT,
    created_at       TIMESTAMP,
    updated_by       BIGINT,
    updated_at       TIMESTAMP,
    deleted          INT           NOT NULL DEFAULT 0,
    version          INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_mfg_op_record_no ON mfg_operation_record (record_no);
CREATE INDEX idx_mfg_op_batch ON mfg_operation_record (batch_no);
CREATE INDEX idx_mfg_op_serial ON mfg_operation_record (serial_no);
CREATE INDEX idx_mfg_op_code ON mfg_operation_record (operation_code);
CREATE INDEX idx_mfg_op_station ON mfg_operation_record (work_station);
CREATE INDEX idx_mfg_op_result ON mfg_operation_record (result);

-- ========== DEV-087 关键参数与测试结果 ==========

CREATE TABLE mfg_test_result (
    id               BIGINT        NOT NULL,
    result_no        VARCHAR(64)   NOT NULL,
    batch_no         VARCHAR(64)   NOT NULL,
    serial_no        VARCHAR(64),
    product_code     VARCHAR(64),
    operation_code   VARCHAR(64),
    operation_name   VARCHAR(128),
    test_type        VARCHAR(32)   NOT NULL DEFAULT 'ELECTRICAL',
    test_item_code   VARCHAR(64)   NOT NULL,
    test_item_name   VARCHAR(128),
    standard_value   VARCHAR(128),
    lower_limit      DECIMAL(18, 6),
    upper_limit      DECIMAL(18, 6),
    actual_value     DECIMAL(18, 6),
    actual_text      VARCHAR(128),
    unit             VARCHAR(32),
    result           VARCHAR(16)   NOT NULL DEFAULT 'OK',
    equipment_code   VARCHAR(64),
    tester           VARCHAR(64),
    tested_at        TIMESTAMP,
    source_system    VARCHAR(32),
    attachment_url   VARCHAR(512),
    remark           VARCHAR(255),
    created_by       BIGINT,
    created_at       TIMESTAMP,
    updated_by       BIGINT,
    updated_at       TIMESTAMP,
    deleted          INT           NOT NULL DEFAULT 0,
    version          INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_mfg_test_result_no ON mfg_test_result (result_no);
CREATE INDEX idx_mfg_test_batch ON mfg_test_result (batch_no);
CREATE INDEX idx_mfg_test_serial ON mfg_test_result (serial_no);
CREATE INDEX idx_mfg_test_type ON mfg_test_result (test_type);
CREATE INDEX idx_mfg_test_result ON mfg_test_result (result);

-- ========== DEV-088 单件/批次追溯码绑定（追溯关系表） ==========

CREATE TABLE mfg_trace_binding (
    id                BIGINT        NOT NULL,
    binding_no        VARCHAR(64)   NOT NULL,
    trace_code        VARCHAR(128)  NOT NULL,
    trace_type        VARCHAR(16)   NOT NULL DEFAULT 'SINGLE',
    batch_no          VARCHAR(64),
    serial_no         VARCHAR(64),
    product_code      VARCHAR(64),
    material_code     VARCHAR(64),
    material_name     VARCHAR(128),
    material_batch_no VARCHAR(64),
    material_supplier VARCHAR(64),
    operation_code    VARCHAR(64),
    quantity          DECIMAL(18, 4),
    unit              VARCHAR(32),
    bind_time         TIMESTAMP,
    source_system     VARCHAR(32),
    remark            VARCHAR(255),
    created_by        BIGINT,
    created_at        TIMESTAMP,
    updated_by        BIGINT,
    updated_at        TIMESTAMP,
    deleted           INT           NOT NULL DEFAULT 0,
    version           INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_mfg_trace_binding_no ON mfg_trace_binding (binding_no);
CREATE INDEX idx_mfg_trace_code ON mfg_trace_binding (trace_code);
CREATE INDEX idx_mfg_trace_batch ON mfg_trace_binding (batch_no);
CREATE INDEX idx_mfg_trace_serial ON mfg_trace_binding (serial_no);
CREATE INDEX idx_mfg_trace_material ON mfg_trace_binding (material_code, material_batch_no);

-- ========== DEV-089 包装规则与箱码 ==========

CREATE TABLE mfg_package_rule (
    id                  BIGINT        NOT NULL,
    rule_no             VARCHAR(64)   NOT NULL,
    product_code        VARCHAR(64)   NOT NULL,
    package_level       VARCHAR(16)   NOT NULL DEFAULT 'INNER',
    package_qty         DECIMAL(18, 4) NOT NULL DEFAULT 1,
    inner_qty_per_box   DECIMAL(18, 4),
    box_per_pallet      DECIMAL(18, 4),
    label_template_code VARCHAR(64),
    customer_code       VARCHAR(64),
    status              VARCHAR(16)   NOT NULL DEFAULT 'enabled',
    remark              VARCHAR(255),
    created_by          BIGINT,
    created_at          TIMESTAMP,
    updated_by          BIGINT,
    updated_at          TIMESTAMP,
    deleted             INT           NOT NULL DEFAULT 0,
    version             INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_mfg_pkg_rule_no ON mfg_package_rule (rule_no);
CREATE INDEX idx_mfg_pkg_rule_product ON mfg_package_rule (product_code);
CREATE INDEX idx_mfg_pkg_rule_customer ON mfg_package_rule (customer_code);

CREATE TABLE mfg_package (
    id                BIGINT        NOT NULL,
    package_no        VARCHAR(64)   NOT NULL,
    package_code      VARCHAR(128)  NOT NULL,
    package_level     VARCHAR(16)   NOT NULL DEFAULT 'INNER',
    parent_package_no VARCHAR(64),
    product_code      VARCHAR(64),
    batch_no          VARCHAR(64),
    work_order_no     VARCHAR(64),
    package_qty       DECIMAL(18, 4) NOT NULL DEFAULT 0,
    customer_code     VARCHAR(64),
    package_status    VARCHAR(16)   NOT NULL DEFAULT 'OPEN',
    packed_at         TIMESTAMP,
    operator          VARCHAR(64),
    remark            VARCHAR(255),
    created_by        BIGINT,
    created_at        TIMESTAMP,
    updated_by        BIGINT,
    updated_at        TIMESTAMP,
    deleted           INT           NOT NULL DEFAULT 0,
    version           INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_mfg_package_no ON mfg_package (package_no);
CREATE UNIQUE INDEX uk_mfg_package_code ON mfg_package (package_code);
CREATE INDEX idx_mfg_package_batch ON mfg_package (batch_no);
CREATE INDEX idx_mfg_package_parent ON mfg_package (parent_package_no);

CREATE TABLE mfg_package_item (
    id                BIGINT        NOT NULL,
    package_no        VARCHAR(64)   NOT NULL,
    serial_no         VARCHAR(64),
    trace_code        VARCHAR(128),
    material_code     VARCHAR(64),
    material_batch_no VARCHAR(64),
    quantity          DECIMAL(18, 4) NOT NULL DEFAULT 1,
    item_status       VARCHAR(16)   NOT NULL DEFAULT 'PACKED',
    remark            VARCHAR(255),
    created_by        BIGINT,
    created_at        TIMESTAMP,
    updated_by        BIGINT,
    updated_at        TIMESTAMP,
    deleted           INT           NOT NULL DEFAULT 0,
    version           INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE INDEX idx_mfg_pkg_item_package ON mfg_package_item (package_no);
CREATE INDEX idx_mfg_pkg_item_serial ON mfg_package_item (serial_no);
CREATE INDEX idx_mfg_pkg_item_trace ON mfg_package_item (trace_code);

-- ========== DEV-090 / DEV-091 / DEV-092 出货订单匹配、出货扫码防错、发货放行与 ASN ==========

CREATE TABLE mfg_shipment (
    id                BIGINT        NOT NULL,
    shipment_no       VARCHAR(64)   NOT NULL,
    customer_code     VARCHAR(64)   NOT NULL,
    customer_name     VARCHAR(128),
    order_no          VARCHAR(64),
    delivery_plan_no  VARCHAR(64),
    product_code      VARCHAR(64)   NOT NULL,
    product_name      VARCHAR(128),
    product_version   VARCHAR(64),
    order_qty         DECIMAL(18, 4),
    planned_qty       DECIMAL(18, 4),
    scanned_qty       DECIMAL(18, 4) NOT NULL DEFAULT 0,
    shipped_qty       DECIMAL(18, 4) NOT NULL DEFAULT 0,
    package_count     INT           NOT NULL DEFAULT 0,
    shipment_status   VARCHAR(16)   NOT NULL DEFAULT 'CREATED',
    release_status    VARCHAR(16)   NOT NULL DEFAULT 'UNRELEASED',
    carrier           VARCHAR(64),
    vehicle_no        VARCHAR(64),
    driver            VARCHAR(64),
    driver_phone      VARCHAR(32),
    ship_date         DATE,
    asn_no            VARCHAR(64),
    asn_status        VARCHAR(16),
    release_by        VARCHAR(64),
    release_at        TIMESTAMP,
    remark            VARCHAR(255),
    created_by        BIGINT,
    created_at        TIMESTAMP,
    updated_by        BIGINT,
    updated_at        TIMESTAMP,
    deleted           INT           NOT NULL DEFAULT 0,
    version           INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_mfg_shipment_no ON mfg_shipment (shipment_no);
CREATE INDEX idx_mfg_shipment_customer ON mfg_shipment (customer_code);
CREATE INDEX idx_mfg_shipment_order ON mfg_shipment (order_no);
CREATE INDEX idx_mfg_shipment_status ON mfg_shipment (shipment_status);

CREATE TABLE mfg_shipment_line (
    id              BIGINT        NOT NULL,
    shipment_no     VARCHAR(64)   NOT NULL,
    line_no         INT           NOT NULL DEFAULT 1,
    order_no        VARCHAR(64),
    order_line_no   INT,
    product_code    VARCHAR(64),
    product_version VARCHAR(64),
    batch_no        VARCHAR(64),
    serial_no       VARCHAR(64),
    trace_code      VARCHAR(128),
    package_no      VARCHAR(64),
    qty             DECIMAL(18, 4) NOT NULL DEFAULT 0,
    scan_status     VARCHAR(16)   NOT NULL DEFAULT 'PENDING',
    line_status     VARCHAR(16)   NOT NULL DEFAULT 'OPEN',
    remark          VARCHAR(255),
    created_by      BIGINT,
    created_at      TIMESTAMP,
    updated_by      BIGINT,
    updated_at      TIMESTAMP,
    deleted         INT           NOT NULL DEFAULT 0,
    version         INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE INDEX idx_mfg_ship_line_shipment ON mfg_shipment_line (shipment_no);
CREATE INDEX idx_mfg_ship_line_trace ON mfg_shipment_line (trace_code);

CREATE TABLE mfg_ship_scan_log (
    id             BIGINT        NOT NULL,
    log_no         VARCHAR(64)   NOT NULL,
    shipment_no    VARCHAR(64)   NOT NULL,
    scan_code      VARCHAR(128)  NOT NULL,
    scan_type      VARCHAR(16)   NOT NULL DEFAULT 'SERIAL',
    scan_result    VARCHAR(16)   NOT NULL DEFAULT 'PASS',
    block_reason   VARCHAR(255),
    customer_code  VARCHAR(64),
    product_code   VARCHAR(64),
    product_version VARCHAR(64),
    batch_no       VARCHAR(64),
    qty            DECIMAL(18, 4),
    operator       VARCHAR(64),
    scan_time      TIMESTAMP,
    remark         VARCHAR(255),
    created_by     BIGINT,
    created_at     TIMESTAMP,
    updated_by     BIGINT,
    updated_at     TIMESTAMP,
    deleted        INT           NOT NULL DEFAULT 0,
    version        INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_mfg_ship_scan_no ON mfg_ship_scan_log (log_no);
CREATE INDEX idx_mfg_ship_scan_shipment ON mfg_ship_scan_log (shipment_no);
CREATE INDEX idx_mfg_ship_scan_code ON mfg_ship_scan_log (scan_code);
CREATE INDEX idx_mfg_ship_scan_result ON mfg_ship_scan_log (scan_result);

-- ========== DEV-093 / DEV-094 召回与批次隔离 ==========

CREATE TABLE mfg_recall_order (
    id             BIGINT        NOT NULL,
    recall_no      VARCHAR(64)   NOT NULL,
    recall_type    VARCHAR(32)   NOT NULL DEFAULT 'MATERIAL_BATCH',
    trigger_source VARCHAR(64),
    target_value   VARCHAR(255),
    risk_level     VARCHAR(16)   NOT NULL DEFAULT 'MEDIUM',
    recall_status  VARCHAR(16)   NOT NULL DEFAULT 'OPEN',
    affected_count INT           NOT NULL DEFAULT 0,
    owner          VARCHAR(64),
    opened_at      TIMESTAMP,
    closed_at      TIMESTAMP,
    close_evidence VARCHAR(512),
    reason         VARCHAR(512),
    remark         VARCHAR(255),
    created_by     BIGINT,
    created_at     TIMESTAMP,
    updated_by     BIGINT,
    updated_at     TIMESTAMP,
    deleted        INT           NOT NULL DEFAULT 0,
    version        INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_mfg_recall_no ON mfg_recall_order (recall_no);
CREATE INDEX idx_mfg_recall_type ON mfg_recall_order (recall_type);
CREATE INDEX idx_mfg_recall_status ON mfg_recall_order (recall_status);

CREATE TABLE mfg_recall_impact (
    id             BIGINT        NOT NULL,
    recall_no      VARCHAR(64)   NOT NULL,
    impact_type    VARCHAR(32)   NOT NULL DEFAULT 'PRODUCT',
    impact_ref_no  VARCHAR(128),
    product_code   VARCHAR(64),
    batch_no       VARCHAR(64),
    material_code  VARCHAR(64),
    material_batch_no VARCHAR(64),
    customer_code  VARCHAR(64),
    qty            DECIMAL(18, 4),
    impact_status  VARCHAR(16)   NOT NULL DEFAULT 'IDENTIFIED',
    remark         VARCHAR(255),
    created_by     BIGINT,
    created_at     TIMESTAMP,
    updated_by     BIGINT,
    updated_at     TIMESTAMP,
    deleted        INT           NOT NULL DEFAULT 0,
    version        INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE INDEX idx_mfg_recall_impact_no ON mfg_recall_impact (recall_no);
CREATE INDEX idx_mfg_recall_impact_type ON mfg_recall_impact (impact_type);
CREATE INDEX idx_mfg_recall_impact_batch ON mfg_recall_impact (batch_no);
