-- G3-N5 ERP—库存核算（对应总任务书 WBS T027 库存核算、T097 库存业务，属 G3 ERP）。
-- 说明：SQL 同时兼容 PostgreSQL 与 H2（PostgreSQL 兼容模式），主键由应用侧雪花算法生成。
-- 设计原则：
--   1) 主数据权责约束（见《主数据权责》表）：
--      「产品/零件/物料定义」权威源为 PLM，「库存/库位/批次」权威源为 WMS，
--      「组织/人员/角色」权威源为统一身份平台。本模块登记 ERP 侧库存账与库存业务单据，
--      物料以 PLM 下发的 material_code 作为业务键引用，仓库/库位/批次以 WMS 下发的编码引用；
--      采购/委外/产成品入库、材料/委外材料/销售出库等来源单据由本节点引用单号，不重复建表。
--   2) 平台公共能力复用（不重复建表）：币种（sys_currency）、仓库（sys_warehouse）、
--      单据状态机（sys_doc_state_*）、审批（oa_process_*）由 G1 平台底座提供，ERP 侧按编码引用；
--      库存单据状态、成本核算方式等业务语义字段在本模块内维护。
--   3) 单据编号规则：*_no 支持人工指定，未指定时由服务层按统一前缀自动生成；
--      库存业务链：库存余额/收发存台账（erp_inventory_balance）与库存流水（erp_inventory_transaction）
--      → 调拨（erp_inventory_transfer/_line）→ 盘点（erp_inventory_count/_line）
--      → 形态转换（erp_inventory_conversion）→ 报废（erp_inventory_scrap）
--      → 冻结（erp_inventory_freeze）→ 库存成本（erp_inventory_cost）。
-- 注意：
--   a) 业务字段一律不得命名为 version，避免与 BaseEntity 的乐观锁字段 version 冲突。
--   b) 具备业务编码唯一索引的单据表删除语义为「释放编码」，由服务层执行物理删除；
--      调拨行、盘点行无业务编码唯一索引，随头删除时逻辑删除即可。

-- ========== T027 ERP 库存余额（收发存台账） ==========

CREATE TABLE erp_inventory_balance (
    id              BIGINT         NOT NULL,
    material_code   VARCHAR(64)    NOT NULL,
    material_name   VARCHAR(200),
    spec            VARCHAR(255),
    uom             VARCHAR(32)    NOT NULL DEFAULT 'PCS',
    warehouse_code  VARCHAR(64)    NOT NULL,
    warehouse_name  VARCHAR(128),
    location_code   VARCHAR(64)    NOT NULL DEFAULT '',
    batch_no        VARCHAR(64)    NOT NULL DEFAULT '',
    on_hand_qty     DECIMAL(18, 6) NOT NULL DEFAULT 0,
    locked_qty      DECIMAL(18, 6) NOT NULL DEFAULT 0,
    available_qty   DECIMAL(18, 6) NOT NULL DEFAULT 0,
    in_transit_qty  DECIMAL(18, 6) NOT NULL DEFAULT 0,
    avg_cost        DECIMAL(18, 6) NOT NULL DEFAULT 0,
    amount          DECIMAL(18, 6) NOT NULL DEFAULT 0,
    org_id          BIGINT,
    org_name        VARCHAR(128),
    description     VARCHAR(1000),
    remark          VARCHAR(500),
    created_by      BIGINT,
    created_at      TIMESTAMP,
    updated_by      BIGINT,
    updated_at      TIMESTAMP,
    deleted         INT            NOT NULL DEFAULT 0,
    version         INT            NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_erp_inventory_balance_dim ON erp_inventory_balance (material_code, warehouse_code, location_code, batch_no);
CREATE INDEX idx_erp_inventory_balance_material ON erp_inventory_balance (material_code);
CREATE INDEX idx_erp_inventory_balance_warehouse ON erp_inventory_balance (warehouse_code);

-- ========== T097 ERP 库存流水（收发存明细） ==========

CREATE TABLE erp_inventory_transaction (
    id               BIGINT         NOT NULL,
    transaction_no   VARCHAR(64)    NOT NULL,
    transaction_type VARCHAR(32)    NOT NULL DEFAULT 'IN',
    biz_type         VARCHAR(32)    NOT NULL DEFAULT 'MANUAL',
    direction        VARCHAR(16)    NOT NULL DEFAULT 'IN',
    biz_no           VARCHAR(64),
    material_code    VARCHAR(64)    NOT NULL,
    material_name    VARCHAR(200),
    spec             VARCHAR(255),
    uom              VARCHAR(32)    NOT NULL DEFAULT 'PCS',
    warehouse_code   VARCHAR(64),
    location_code    VARCHAR(64)    NOT NULL DEFAULT '',
    batch_no         VARCHAR(64)    NOT NULL DEFAULT '',
    qty              DECIMAL(18, 6) NOT NULL DEFAULT 0,
    unit_cost        DECIMAL(18, 6) NOT NULL DEFAULT 0,
    amount           DECIMAL(18, 6) NOT NULL DEFAULT 0,
    transaction_date TIMESTAMP,
    operator         VARCHAR(128),
    transaction_status VARCHAR(32)  NOT NULL DEFAULT 'POSTED',
    org_id           BIGINT,
    org_name         VARCHAR(128),
    description      VARCHAR(1000),
    remark           VARCHAR(500),
    created_by       BIGINT,
    created_at       TIMESTAMP,
    updated_by       BIGINT,
    updated_at       TIMESTAMP,
    deleted          INT            NOT NULL DEFAULT 0,
    version          INT            NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_erp_inventory_transaction_no ON erp_inventory_transaction (transaction_no);
CREATE INDEX idx_erp_inventory_transaction_material ON erp_inventory_transaction (material_code);
CREATE INDEX idx_erp_inventory_transaction_biz ON erp_inventory_transaction (biz_no);
CREATE INDEX idx_erp_inventory_transaction_type ON erp_inventory_transaction (transaction_type);

-- ========== T027/T097 ERP 库存调拨头 ==========

CREATE TABLE erp_inventory_transfer (
    id                  BIGINT         NOT NULL,
    transfer_no         VARCHAR(64)    NOT NULL,
    transfer_type       VARCHAR(32)    NOT NULL DEFAULT 'DIRECT',
    from_warehouse_code VARCHAR(64),
    from_warehouse_name VARCHAR(128),
    to_warehouse_code   VARCHAR(64),
    to_warehouse_name   VARCHAR(128),
    transfer_by         VARCHAR(128),
    transfer_date       TIMESTAMP,
    total_qty           DECIMAL(18, 6) NOT NULL DEFAULT 0,
    transfer_status     VARCHAR(32)    NOT NULL DEFAULT 'DRAFT',
    org_id              BIGINT,
    org_name            VARCHAR(128),
    description         VARCHAR(1000),
    remark              VARCHAR(500),
    created_by          BIGINT,
    created_at          TIMESTAMP,
    updated_by          BIGINT,
    updated_at          TIMESTAMP,
    deleted             INT            NOT NULL DEFAULT 0,
    version             INT            NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_erp_inventory_transfer_no ON erp_inventory_transfer (transfer_no);
CREATE INDEX idx_erp_inventory_transfer_status ON erp_inventory_transfer (transfer_status);
CREATE INDEX idx_erp_inventory_transfer_from ON erp_inventory_transfer (from_warehouse_code);

-- ========== T027 ERP 库存调拨行（主子表：行，随头级联删除） ==========

CREATE TABLE erp_inventory_transfer_line (
    id                 BIGINT         NOT NULL,
    transfer_id        BIGINT         NOT NULL,
    transfer_no        VARCHAR(64)    NOT NULL,
    line_no            INT            NOT NULL DEFAULT 1,
    line_status        VARCHAR(32)    NOT NULL DEFAULT 'OPEN',
    material_code      VARCHAR(64)    NOT NULL,
    material_name      VARCHAR(200),
    spec               VARCHAR(255),
    uom                VARCHAR(32)    NOT NULL DEFAULT 'PCS',
    batch_no           VARCHAR(64)    NOT NULL DEFAULT '',
    from_location_code VARCHAR(64)    NOT NULL DEFAULT '',
    to_location_code   VARCHAR(64)    NOT NULL DEFAULT '',
    transfer_qty       DECIMAL(18, 6) NOT NULL DEFAULT 0,
    remark             VARCHAR(500),
    created_by         BIGINT,
    created_at         TIMESTAMP,
    updated_by         BIGINT,
    updated_at         TIMESTAMP,
    deleted            INT            NOT NULL DEFAULT 0,
    version            INT            NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE INDEX idx_erp_inventory_transfer_line_transfer ON erp_inventory_transfer_line (transfer_id);
CREATE INDEX idx_erp_inventory_transfer_line_no ON erp_inventory_transfer_line (transfer_no);

-- ========== T027 ERP 库存盘点头 ==========

CREATE TABLE erp_inventory_count (
    id               BIGINT         NOT NULL,
    count_no         VARCHAR(64)    NOT NULL,
    count_type       VARCHAR(32)    NOT NULL DEFAULT 'FULL',
    warehouse_code   VARCHAR(64),
    warehouse_name   VARCHAR(128),
    count_by         VARCHAR(128),
    count_date       TIMESTAMP,
    total_diff_qty   DECIMAL(18, 6) NOT NULL DEFAULT 0,
    count_status     VARCHAR(32)    NOT NULL DEFAULT 'DRAFT',
    org_id           BIGINT,
    org_name         VARCHAR(128),
    description      VARCHAR(1000),
    remark           VARCHAR(500),
    created_by       BIGINT,
    created_at       TIMESTAMP,
    updated_by       BIGINT,
    updated_at       TIMESTAMP,
    deleted          INT            NOT NULL DEFAULT 0,
    version          INT            NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_erp_inventory_count_no ON erp_inventory_count (count_no);
CREATE INDEX idx_erp_inventory_count_status ON erp_inventory_count (count_status);
CREATE INDEX idx_erp_inventory_count_warehouse ON erp_inventory_count (warehouse_code);

-- ========== T027 ERP 库存盘点行（主子表：行，随头级联删除） ==========

CREATE TABLE erp_inventory_count_line (
    id             BIGINT         NOT NULL,
    count_id       BIGINT         NOT NULL,
    count_no       VARCHAR(64)    NOT NULL,
    line_no        INT            NOT NULL DEFAULT 1,
    line_status    VARCHAR(32)    NOT NULL DEFAULT 'OPEN',
    material_code  VARCHAR(64)    NOT NULL,
    material_name  VARCHAR(200),
    spec           VARCHAR(255),
    uom            VARCHAR(32)    NOT NULL DEFAULT 'PCS',
    location_code  VARCHAR(64)    NOT NULL DEFAULT '',
    batch_no       VARCHAR(64)    NOT NULL DEFAULT '',
    book_qty       DECIMAL(18, 6) NOT NULL DEFAULT 0,
    actual_qty     DECIMAL(18, 6) NOT NULL DEFAULT 0,
    diff_qty       DECIMAL(18, 6) NOT NULL DEFAULT 0,
    remark         VARCHAR(500),
    created_by     BIGINT,
    created_at     TIMESTAMP,
    updated_by     BIGINT,
    updated_at     TIMESTAMP,
    deleted        INT            NOT NULL DEFAULT 0,
    version        INT            NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE INDEX idx_erp_inventory_count_line_count ON erp_inventory_count_line (count_id);
CREATE INDEX idx_erp_inventory_count_line_no ON erp_inventory_count_line (count_no);

-- ========== T027 ERP 形态转换单 ==========

CREATE TABLE erp_inventory_conversion (
    id                   BIGINT         NOT NULL,
    conversion_no        VARCHAR(64)    NOT NULL,
    conversion_type      VARCHAR(32)    NOT NULL DEFAULT 'SPLIT',
    source_material_code VARCHAR(64)    NOT NULL,
    source_material_name VARCHAR(200),
    source_spec          VARCHAR(255),
    source_uom           VARCHAR(32)    NOT NULL DEFAULT 'PCS',
    source_qty           DECIMAL(18, 6) NOT NULL DEFAULT 0,
    source_batch_no      VARCHAR(64)    NOT NULL DEFAULT '',
    target_material_code VARCHAR(64)    NOT NULL,
    target_material_name VARCHAR(200),
    target_spec          VARCHAR(255),
    target_uom           VARCHAR(32)    NOT NULL DEFAULT 'PCS',
    target_qty           DECIMAL(18, 6) NOT NULL DEFAULT 0,
    warehouse_code       VARCHAR(64),
    conversion_by        VARCHAR(128),
    conversion_date      TIMESTAMP,
    conversion_status    VARCHAR(32)    NOT NULL DEFAULT 'DRAFT',
    org_id               BIGINT,
    org_name             VARCHAR(128),
    description          VARCHAR(1000),
    remark               VARCHAR(500),
    created_by           BIGINT,
    created_at           TIMESTAMP,
    updated_by           BIGINT,
    updated_at           TIMESTAMP,
    deleted              INT            NOT NULL DEFAULT 0,
    version              INT            NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_erp_inventory_conversion_no ON erp_inventory_conversion (conversion_no);
CREATE INDEX idx_erp_inventory_conversion_status ON erp_inventory_conversion (conversion_status);
CREATE INDEX idx_erp_inventory_conversion_source ON erp_inventory_conversion (source_material_code);

-- ========== T027 ERP 库存报废单 ==========

CREATE TABLE erp_inventory_scrap (
    id             BIGINT         NOT NULL,
    scrap_no       VARCHAR(64)    NOT NULL,
    scrap_type     VARCHAR(32)    NOT NULL DEFAULT 'NORMAL',
    material_code  VARCHAR(64)    NOT NULL,
    material_name  VARCHAR(200),
    spec           VARCHAR(255),
    uom            VARCHAR(32)    NOT NULL DEFAULT 'PCS',
    warehouse_code VARCHAR(64),
    location_code  VARCHAR(64)    NOT NULL DEFAULT '',
    batch_no       VARCHAR(64)    NOT NULL DEFAULT '',
    scrap_qty      DECIMAL(18, 6) NOT NULL DEFAULT 0,
    scrap_reason   VARCHAR(500),
    scrap_by       VARCHAR(128),
    scrap_date     TIMESTAMP,
    scrap_status   VARCHAR(32)    NOT NULL DEFAULT 'DRAFT',
    org_id         BIGINT,
    org_name       VARCHAR(128),
    description    VARCHAR(1000),
    remark         VARCHAR(500),
    created_by     BIGINT,
    created_at     TIMESTAMP,
    updated_by     BIGINT,
    updated_at     TIMESTAMP,
    deleted        INT            NOT NULL DEFAULT 0,
    version        INT            NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_erp_inventory_scrap_no ON erp_inventory_scrap (scrap_no);
CREATE INDEX idx_erp_inventory_scrap_status ON erp_inventory_scrap (scrap_status);
CREATE INDEX idx_erp_inventory_scrap_material ON erp_inventory_scrap (material_code);

-- ========== T027 ERP 库存冻结单 ==========

CREATE TABLE erp_inventory_freeze (
    id             BIGINT         NOT NULL,
    freeze_no      VARCHAR(64)    NOT NULL,
    freeze_type    VARCHAR(32)    NOT NULL DEFAULT 'MANUAL',
    material_code  VARCHAR(64)    NOT NULL,
    material_name  VARCHAR(200),
    spec           VARCHAR(255),
    uom            VARCHAR(32)    NOT NULL DEFAULT 'PCS',
    warehouse_code VARCHAR(64),
    location_code  VARCHAR(64)    NOT NULL DEFAULT '',
    batch_no       VARCHAR(64)    NOT NULL DEFAULT '',
    freeze_qty     DECIMAL(18, 6) NOT NULL DEFAULT 0,
    freeze_reason  VARCHAR(500),
    freeze_by      VARCHAR(128),
    freeze_date    TIMESTAMP,
    unfreeze_date  TIMESTAMP,
    freeze_status  VARCHAR(32)    NOT NULL DEFAULT 'FROZEN',
    org_id         BIGINT,
    org_name       VARCHAR(128),
    description    VARCHAR(1000),
    remark         VARCHAR(500),
    created_by     BIGINT,
    created_at     TIMESTAMP,
    updated_by     BIGINT,
    updated_at     TIMESTAMP,
    deleted        INT            NOT NULL DEFAULT 0,
    version        INT            NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_erp_inventory_freeze_no ON erp_inventory_freeze (freeze_no);
CREATE INDEX idx_erp_inventory_freeze_status ON erp_inventory_freeze (freeze_status);
CREATE INDEX idx_erp_inventory_freeze_material ON erp_inventory_freeze (material_code);

-- ========== T027 ERP 库存成本核算单 ==========

CREATE TABLE erp_inventory_cost (
    id             BIGINT         NOT NULL,
    cost_no        VARCHAR(64)    NOT NULL,
    cost_method    VARCHAR(32)    NOT NULL DEFAULT 'MOVING_AVG',
    period         VARCHAR(32),
    material_code  VARCHAR(64)    NOT NULL,
    material_name  VARCHAR(200),
    spec           VARCHAR(255),
    uom            VARCHAR(32)    NOT NULL DEFAULT 'PCS',
    warehouse_code VARCHAR(64),
    begin_qty      DECIMAL(18, 6) NOT NULL DEFAULT 0,
    begin_amount   DECIMAL(18, 6) NOT NULL DEFAULT 0,
    in_qty         DECIMAL(18, 6) NOT NULL DEFAULT 0,
    in_amount      DECIMAL(18, 6) NOT NULL DEFAULT 0,
    out_qty        DECIMAL(18, 6) NOT NULL DEFAULT 0,
    out_amount     DECIMAL(18, 6) NOT NULL DEFAULT 0,
    end_qty        DECIMAL(18, 6) NOT NULL DEFAULT 0,
    end_amount     DECIMAL(18, 6) NOT NULL DEFAULT 0,
    avg_cost       DECIMAL(18, 6) NOT NULL DEFAULT 0,
    cost_by        VARCHAR(128),
    cost_date      TIMESTAMP,
    cost_status    VARCHAR(32)    NOT NULL DEFAULT 'DRAFT',
    org_id         BIGINT,
    org_name       VARCHAR(128),
    description    VARCHAR(1000),
    remark         VARCHAR(500),
    created_by     BIGINT,
    created_at     TIMESTAMP,
    updated_by     BIGINT,
    updated_at     TIMESTAMP,
    deleted        INT            NOT NULL DEFAULT 0,
    version        INT            NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_erp_inventory_cost_no ON erp_inventory_cost (cost_no);
CREATE INDEX idx_erp_inventory_cost_material ON erp_inventory_cost (material_code);
CREATE INDEX idx_erp_inventory_cost_period ON erp_inventory_cost (period);
