-- N7 物料供应、Kanban、FIFO 与缺料管理：库位货架与物料标识、电子看板、物料配送、
-- 扫码领料校验、FIFO 规则引擎、防混料绑定、线边库存与库存流水、缺料预警、欠料闭环、应急预案
-- 说明：SQL 同时兼容 PostgreSQL 与 H2（PostgreSQL 兼容模式），主键由应用侧雪花算法生成。

-- ========== DEV-075 库位货架与物料标识（库位主数据） ==========

CREATE TABLE wms_storage_location (
    id            BIGINT        NOT NULL,
    location_code VARCHAR(64)   NOT NULL,
    location_name VARCHAR(128)  NOT NULL,
    warehouse_code VARCHAR(64),
    area_code     VARCHAR(64),
    rack_code     VARCHAR(64),
    level_code    VARCHAR(32),
    bin_code      VARCHAR(32),
    location_type VARCHAR(16)   NOT NULL DEFAULT 'RACK',
    line_code     VARCHAR(64),
    capacity      DECIMAL(18, 4),
    status        VARCHAR(16)   NOT NULL DEFAULT 'enabled',
    remark        VARCHAR(255),
    created_by    BIGINT,
    created_at    TIMESTAMP,
    updated_by    BIGINT,
    updated_at    TIMESTAMP,
    deleted       INT           NOT NULL DEFAULT 0,
    version       INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_wms_location_code ON wms_storage_location (location_code);
CREATE INDEX idx_wms_location_type ON wms_storage_location (location_type);
CREATE INDEX idx_wms_location_line ON wms_storage_location (line_code);

-- ========== DEV-075 / DEV-079 / DEV-081 批次库存与物料标识（载 FIFO 判定依据） ==========

CREATE TABLE wms_material_batch (
    id               BIGINT        NOT NULL,
    batch_no         VARCHAR(64)   NOT NULL,
    material_code    VARCHAR(64)   NOT NULL,
    material_name    VARCHAR(128),
    location_code    VARCHAR(64),
    container_code   VARCHAR(64),
    supplier_code    VARCHAR(64),
    qty_on_hand      DECIMAL(18, 4) NOT NULL DEFAULT 0,
    unit             VARCHAR(32),
    inbound_date     DATE,
    release_date     DATE,
    production_date  DATE,
    expiry_date      DATE,
    inspection_status VARCHAR(16)  NOT NULL DEFAULT 'RELEASED',
    batch_status     VARCHAR(16)   NOT NULL DEFAULT 'IN_STOCK',
    work_order_no    VARCHAR(64),
    remark           VARCHAR(255),
    created_by       BIGINT,
    created_at       TIMESTAMP,
    updated_by       BIGINT,
    updated_at       TIMESTAMP,
    deleted          INT           NOT NULL DEFAULT 0,
    version          INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_wms_batch ON wms_material_batch (material_code, batch_no, location_code);
CREATE INDEX idx_wms_batch_material ON wms_material_batch (material_code);
CREATE INDEX idx_wms_batch_location ON wms_material_batch (location_code);
CREATE INDEX idx_wms_batch_status ON wms_material_batch (batch_status);

-- ========== DEV-076 电子看板 Kanban ==========

CREATE TABLE wms_kanban (
    id                  BIGINT        NOT NULL,
    kanban_no           VARCHAR(64)   NOT NULL,
    kanban_type         VARCHAR(16)   NOT NULL DEFAULT 'PRODUCTION',
    material_code       VARCHAR(64)   NOT NULL,
    material_name       VARCHAR(128),
    from_location_code  VARCHAR(64),
    line_code           VARCHAR(64),
    work_station        VARCHAR(64),
    container_qty       DECIMAL(18, 4) NOT NULL DEFAULT 0,
    replenish_point     DECIMAL(18, 4) NOT NULL DEFAULT 0,
    min_qty             DECIMAL(18, 4) NOT NULL DEFAULT 0,
    max_qty             DECIMAL(18, 4) NOT NULL DEFAULT 0,
    current_qty         DECIMAL(18, 4) NOT NULL DEFAULT 0,
    kanban_status       VARCHAR(16)   NOT NULL DEFAULT 'FULL',
    pull_signal         VARCHAR(16),
    supplier_code       VARCHAR(64),
    lead_time_days      INT,
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
CREATE UNIQUE INDEX uk_wms_kanban_no ON wms_kanban (kanban_no);
CREATE INDEX idx_wms_kanban_material ON wms_kanban (material_code);
CREATE INDEX idx_wms_kanban_line ON wms_kanban (line_code);
CREATE INDEX idx_wms_kanban_status ON wms_kanban (kanban_status);

-- ========== DEV-077 物料配送任务 ==========

CREATE TABLE wms_delivery_task (
    id                 BIGINT        NOT NULL,
    task_no            VARCHAR(64)   NOT NULL,
    kanban_no          VARCHAR(64),
    task_type          VARCHAR(16)   NOT NULL DEFAULT 'REPLENISH',
    material_code      VARCHAR(64)   NOT NULL,
    material_name      VARCHAR(128),
    qty                DECIMAL(18, 4) NOT NULL DEFAULT 0,
    unit               VARCHAR(32),
    from_location_code VARCHAR(64),
    to_location_code   VARCHAR(64),
    line_code          VARCHAR(64),
    work_station       VARCHAR(64),
    batch_no           VARCHAR(64),
    priority           INT           NOT NULL DEFAULT 5,
    task_status        VARCHAR(16)   NOT NULL DEFAULT 'CREATED',
    assignee           VARCHAR(64),
    dispatch_at        TIMESTAMP,
    accept_at          TIMESTAMP,
    deliver_at         TIMESTAMP,
    sign_at            TIMESTAMP,
    sign_by            VARCHAR(64),
    remark             VARCHAR(255),
    created_by         BIGINT,
    created_at         TIMESTAMP,
    updated_by         BIGINT,
    updated_at         TIMESTAMP,
    deleted            INT           NOT NULL DEFAULT 0,
    version            INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_wms_delivery_task_no ON wms_delivery_task (task_no);
CREATE INDEX idx_wms_delivery_status ON wms_delivery_task (task_status);
CREATE INDEX idx_wms_delivery_line ON wms_delivery_task (line_code);
CREATE INDEX idx_wms_delivery_kanban ON wms_delivery_task (kanban_no);

-- ========== DEV-078 扫码领料校验（含 FIFO 与防混料校验结果） ==========

CREATE TABLE wms_pick_record (
    id                    BIGINT        NOT NULL,
    pick_no               VARCHAR(64)   NOT NULL,
    work_order_no         VARCHAR(64),
    material_code         VARCHAR(64)   NOT NULL,
    material_name         VARCHAR(128),
    batch_no              VARCHAR(64),
    location_code         VARCHAR(64),
    container_code        VARCHAR(64),
    qty                   DECIMAL(18, 4) NOT NULL DEFAULT 0,
    unit                  VARCHAR(32),
    line_code             VARCHAR(64),
    work_station          VARCHAR(64),
    operator_name         VARCHAR(64),
    scan_result           VARCHAR(16)   NOT NULL DEFAULT 'PASS',
    fifo_result           VARCHAR(16),
    fifo_rule_code        VARCHAR(64),
    expected_batch_no     VARCHAR(64),
    mix_check_result      VARCHAR(16),
    binding_no            VARCHAR(64),
    block_reason          VARCHAR(500),
    exception_authorized  INT           NOT NULL DEFAULT 0,
    authorized_by         VARCHAR(64),
    authorize_reason      VARCHAR(255),
    related_delivery_no   VARCHAR(64),
    pick_at               TIMESTAMP,
    remark                VARCHAR(255),
    created_by            BIGINT,
    created_at            TIMESTAMP,
    updated_by            BIGINT,
    updated_at            TIMESTAMP,
    deleted               INT           NOT NULL DEFAULT 0,
    version               INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_wms_pick_no ON wms_pick_record (pick_no);
CREATE INDEX idx_wms_pick_work_order ON wms_pick_record (work_order_no);
CREATE INDEX idx_wms_pick_material ON wms_pick_record (material_code);
CREATE INDEX idx_wms_pick_batch ON wms_pick_record (batch_no);
CREATE INDEX idx_wms_pick_result ON wms_pick_record (scan_result);

-- ========== DEV-079 FIFO 规则引擎 ==========

CREATE TABLE wms_fifo_rule (
    id                BIGINT        NOT NULL,
    rule_code         VARCHAR(64)   NOT NULL,
    rule_name         VARCHAR(128)  NOT NULL,
    scope             VARCHAR(16)   NOT NULL DEFAULT 'GLOBAL',
    customer_code     VARCHAR(64),
    material_code     VARCHAR(64),
    fifo_basis        VARCHAR(16)   NOT NULL DEFAULT 'INBOUND_DATE',
    expiry_check      INT           NOT NULL DEFAULT 1,
    expiry_warn_days  INT,
    allow_exception   INT           NOT NULL DEFAULT 0,
    exception_role    VARCHAR(64),
    priority          INT           NOT NULL DEFAULT 10,
    status            INT           NOT NULL DEFAULT 1,
    remark            VARCHAR(255),
    created_by        BIGINT,
    created_at        TIMESTAMP,
    updated_by        BIGINT,
    updated_at        TIMESTAMP,
    deleted           INT           NOT NULL DEFAULT 0,
    version           INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_wms_fifo_rule_code ON wms_fifo_rule (rule_code);
CREATE INDEX idx_wms_fifo_rule_scope ON wms_fifo_rule (scope);
CREATE INDEX idx_wms_fifo_rule_material ON wms_fifo_rule (material_code);
CREATE INDEX idx_wms_fifo_rule_customer ON wms_fifo_rule (customer_code);

-- ========== DEV-080 防混料绑定（物料/批次/容器/工位绑定） ==========

CREATE TABLE wms_material_binding (
    id             BIGINT        NOT NULL,
    binding_no     VARCHAR(64)   NOT NULL,
    bind_type      VARCHAR(32)   NOT NULL DEFAULT 'LINE_MATERIAL',
    line_code      VARCHAR(64),
    work_station   VARCHAR(64),
    material_code  VARCHAR(64)   NOT NULL,
    batch_no       VARCHAR(64),
    container_code VARCHAR(64),
    effective_from TIMESTAMP,
    effective_to   TIMESTAMP,
    bind_status    VARCHAR(16)   NOT NULL DEFAULT 'enabled',
    remark         VARCHAR(255),
    created_by     BIGINT,
    created_at     TIMESTAMP,
    updated_by     BIGINT,
    updated_at     TIMESTAMP,
    deleted        INT           NOT NULL DEFAULT 0,
    version        INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_wms_binding_no ON wms_material_binding (binding_no);
CREATE INDEX idx_wms_binding_line ON wms_material_binding (line_code);
CREATE INDEX idx_wms_binding_station ON wms_material_binding (work_station);
CREATE INDEX idx_wms_binding_material ON wms_material_binding (material_code);

-- ========== DEV-081 线边库存 ==========

CREATE TABLE wms_line_side_stock (
    id             BIGINT        NOT NULL,
    line_code      VARCHAR(64)   NOT NULL,
    work_station   VARCHAR(64)   NOT NULL DEFAULT '',
    material_code  VARCHAR(64)   NOT NULL,
    material_name  VARCHAR(128),
    batch_no       VARCHAR(64)   NOT NULL DEFAULT '',
    container_code VARCHAR(64),
    unit           VARCHAR(32),
    qty_on_hand    DECIMAL(18, 4) NOT NULL DEFAULT 0,
    qty_issued     DECIMAL(18, 4) NOT NULL DEFAULT 0,
    qty_consumed   DECIMAL(18, 4) NOT NULL DEFAULT 0,
    qty_returned   DECIMAL(18, 4) NOT NULL DEFAULT 0,
    qty_scrapped   DECIMAL(18, 4) NOT NULL DEFAULT 0,
    safety_stock   DECIMAL(18, 4),
    stock_status   VARCHAR(16)   NOT NULL DEFAULT 'NORMAL',
    remark         VARCHAR(255),
    created_by     BIGINT,
    created_at     TIMESTAMP,
    updated_by     BIGINT,
    updated_at     TIMESTAMP,
    deleted        INT           NOT NULL DEFAULT 0,
    version        INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_wms_line_stock ON wms_line_side_stock (line_code, work_station, material_code, batch_no);
CREATE INDEX idx_wms_line_stock_material ON wms_line_side_stock (material_code);
CREATE INDEX idx_wms_line_stock_status ON wms_line_side_stock (stock_status);

-- ========== DEV-081 库存流水（发料/消耗/退料/报废/盘点差异） ==========

CREATE TABLE wms_inventory_txn (
    id                 BIGINT        NOT NULL,
    txn_no             VARCHAR(64)   NOT NULL,
    txn_type           VARCHAR(16)   NOT NULL,
    material_code      VARCHAR(64)   NOT NULL,
    batch_no           VARCHAR(64),
    from_location_code VARCHAR(64),
    to_location_code   VARCHAR(64),
    qty                DECIMAL(18, 4) NOT NULL DEFAULT 0,
    unit               VARCHAR(32),
    work_order_no      VARCHAR(64),
    line_code          VARCHAR(64),
    work_station       VARCHAR(64),
    ref_no             VARCHAR(64),
    operator_name      VARCHAR(64),
    txn_at             TIMESTAMP,
    remark             VARCHAR(255),
    created_by         BIGINT,
    created_at         TIMESTAMP,
    updated_by         BIGINT,
    updated_at         TIMESTAMP,
    deleted            INT           NOT NULL DEFAULT 0,
    version            INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_wms_txn_no ON wms_inventory_txn (txn_no);
CREATE INDEX idx_wms_txn_type ON wms_inventory_txn (txn_type);
CREATE INDEX idx_wms_txn_material ON wms_inventory_txn (material_code);
CREATE INDEX idx_wms_txn_batch ON wms_inventory_txn (batch_no);
CREATE INDEX idx_wms_txn_at ON wms_inventory_txn (txn_at);

-- ========== DEV-082 缺料预警 ==========

CREATE TABLE wms_shortage_warning (
    id                     BIGINT        NOT NULL,
    warning_no             VARCHAR(64)   NOT NULL,
    material_code          VARCHAR(64)   NOT NULL,
    material_name          VARCHAR(128),
    line_code              VARCHAR(64),
    work_order_no          VARCHAR(64),
    required_qty           DECIMAL(18, 4) NOT NULL DEFAULT 0,
    on_hand_qty            DECIMAL(18, 4) NOT NULL DEFAULT 0,
    in_transit_qty         DECIMAL(18, 4) NOT NULL DEFAULT 0,
    safety_stock           DECIMAL(18, 4) NOT NULL DEFAULT 0,
    gap_qty                DECIMAL(18, 4) NOT NULL DEFAULT 0,
    required_date          DATE,
    purchase_lead_time_days INT,
    warning_level          VARCHAR(16)   NOT NULL DEFAULT 'L1',
    calc_basis             VARCHAR(500),
    warning_status         VARCHAR(16)   NOT NULL DEFAULT 'OPEN',
    calc_at                TIMESTAMP,
    source                 VARCHAR(16)   NOT NULL DEFAULT 'CALC',
    remark                 VARCHAR(255),
    created_by             BIGINT,
    created_at             TIMESTAMP,
    updated_by             BIGINT,
    updated_at             TIMESTAMP,
    deleted                INT           NOT NULL DEFAULT 0,
    version                INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_wms_warning_no ON wms_shortage_warning (warning_no);
CREATE INDEX idx_wms_warning_material ON wms_shortage_warning (material_code);
CREATE INDEX idx_wms_warning_line ON wms_shortage_warning (line_code);
CREATE INDEX idx_wms_warning_status ON wms_shortage_warning (warning_status);
CREATE INDEX idx_wms_warning_level ON wms_shortage_warning (warning_level);

-- ========== DEV-083 欠料异常闭环 ==========

CREATE TABLE wms_shortage_case (
    id                   BIGINT        NOT NULL,
    case_no              VARCHAR(64)   NOT NULL,
    warning_no           VARCHAR(64),
    material_code        VARCHAR(64)   NOT NULL,
    material_name        VARCHAR(128),
    line_code            VARCHAR(64),
    affected_work_orders VARCHAR(500),
    owner                VARCHAR(64),
    cause                VARCHAR(500),
    temp_measure         VARCHAR(500),
    expected_recovery_date DATE,
    case_status          VARCHAR(16)   NOT NULL DEFAULT 'OPEN',
    close_evidence       VARCHAR(500),
    closed_by            VARCHAR(64),
    closed_at            TIMESTAMP,
    remark               VARCHAR(255),
    created_by           BIGINT,
    created_at           TIMESTAMP,
    updated_by           BIGINT,
    updated_at           TIMESTAMP,
    deleted              INT           NOT NULL DEFAULT 0,
    version              INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_wms_shortage_case_no ON wms_shortage_case (case_no);
CREATE INDEX idx_wms_case_material ON wms_shortage_case (material_code);
CREATE INDEX idx_wms_case_status ON wms_shortage_case (case_status);
CREATE INDEX idx_wms_case_warning ON wms_shortage_case (warning_no);

CREATE TABLE wms_shortage_action (
    id            BIGINT        NOT NULL,
    case_id       BIGINT,
    case_no       VARCHAR(64),
    action_type   VARCHAR(32),
    content       VARCHAR(1000),
    operator_name VARCHAR(64),
    action_at     TIMESTAMP,
    remark        VARCHAR(255),
    created_by    BIGINT,
    created_at    TIMESTAMP,
    updated_by    BIGINT,
    updated_at    TIMESTAMP,
    deleted       INT           NOT NULL DEFAULT 0,
    version       INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE INDEX idx_wms_case_action_case ON wms_shortage_action (case_id);
CREATE INDEX idx_wms_case_action_no ON wms_shortage_action (case_no);

-- ========== DEV-084 应急预案 ==========

CREATE TABLE wms_contingency_plan (
    id                   BIGINT        NOT NULL,
    plan_no              VARCHAR(64)   NOT NULL,
    case_no              VARCHAR(64),
    warning_no           VARCHAR(64),
    material_code        VARCHAR(64)   NOT NULL,
    plan_type            VARCHAR(24)   NOT NULL,
    substitute_material  VARCHAR(64),
    target_location_code VARCHAR(64),
    supplier_code        VARCHAR(64),
    expected_qty         DECIMAL(18, 4),
    expected_date        DATE,
    cost_impact          VARCHAR(255),
    plan_status          VARCHAR(16)   NOT NULL DEFAULT 'DRAFT',
    approver             VARCHAR(64),
    approved_at          TIMESTAMP,
    executed_at          TIMESTAMP,
    remark               VARCHAR(255),
    created_by           BIGINT,
    created_at           TIMESTAMP,
    updated_by           BIGINT,
    updated_at           TIMESTAMP,
    deleted              INT           NOT NULL DEFAULT 0,
    version              INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_wms_plan_no ON wms_contingency_plan (plan_no);
CREATE INDEX idx_wms_plan_material ON wms_contingency_plan (material_code);
CREATE INDEX idx_wms_plan_status ON wms_contingency_plan (plan_status);
CREATE INDEX idx_wms_plan_type ON wms_contingency_plan (plan_type);
CREATE INDEX idx_wms_plan_case ON wms_contingency_plan (case_no);
