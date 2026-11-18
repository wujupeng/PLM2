-- G3-N4a ERP—需求计划（对应总任务书 WBS T025 需求计划、T095 LRP/MRP需求计划，属 G3 ERP）。
-- 说明：SQL 同时兼容 PostgreSQL 与 H2（PostgreSQL 兼容模式），主键由应用侧雪花算法生成。
-- 设计原则：
--   1) 主数据权责约束（见《主数据权责》表）：
--      「产品/零件/物料定义」权威源为 PLM，「BOM/工艺版本」权威源为 PLM，
--      「库存/库位/批次」权威源为 WMS，「客户/销售关系」权威源为 ERP。
--      本模块仅登记需求计划、MRP/LRP 运算批次、净需求与建议单据，
--      物料以 PLM 下发的 material_code、客户以 ERP 客户档案的 customer_code 作为业务键引用，不在此重复维护主档；
--      库存/在途/已分配等数量快照由 WMS 承接，本模块按快照记录运算输入。
--   2) 平台公共能力复用（不重复建表）：币种（sys_currency）、税率（sys_tax_rate）、
--      仓库（sys_warehouse）、单据状态机（sys_doc_state_*）、审批（oa_process_*）由 G1 平台底座提供，
--      ERP 侧按编码引用；计划状态、运算状态等业务语义字段在本模块内维护。
--   3) 单据编号规则：*_no 支持人工指定，未指定时由服务层按统一前缀自动生成；
--      需求计划主链：需求计划单（erp_demand_plan）→ MRP/LRP 运算（erp_mrp_run）
--      → 净需求（erp_net_requirement）→ 采购建议（erp_purchase_suggestion）/生产建议（erp_production_suggestion）
--      → 计划调整（erp_plan_adjustment）；
--      运算依据销售订单/预测、库存、在途、BOM、损耗与提前期计算净需求与建议（T095）。
-- 注意：
--   a) 业务字段一律不得命名为 version，避免与 BaseEntity 的乐观锁字段 version 冲突。
--   b) 具备业务编码唯一索引的单据表删除语义为「释放编码」，由服务层执行物理删除；
--      需求计划行无业务编码唯一索引，随头删除时逻辑删除即可。

-- ========== T025/T095 ERP 需求计划单头 ==========

CREATE TABLE erp_demand_plan (
    id              BIGINT         NOT NULL,
    plan_no         VARCHAR(64)    NOT NULL,
    plan_name       VARCHAR(200),
    plan_type       VARCHAR(32)    NOT NULL DEFAULT 'ORDER',
    plan_source     VARCHAR(32)    NOT NULL DEFAULT 'SALES',
    plan_org        VARCHAR(128),
    planner         VARCHAR(128),
    plan_date       TIMESTAMP,
    horizon_start   TIMESTAMP,
    horizon_end     TIMESTAMP,
    currency_code   VARCHAR(16)    NOT NULL DEFAULT 'CNY',
    plan_status     VARCHAR(32)    NOT NULL DEFAULT 'DRAFT',
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
CREATE UNIQUE INDEX uk_erp_demand_plan_no ON erp_demand_plan (plan_no);
CREATE INDEX idx_erp_demand_plan_status ON erp_demand_plan (plan_status);
CREATE INDEX idx_erp_demand_plan_org ON erp_demand_plan (plan_org);

-- ========== T025/T095 ERP 需求计划行（主子表：行，随头级联删除） ==========

CREATE TABLE erp_demand_plan_line (
    id             BIGINT         NOT NULL,
    plan_id        BIGINT         NOT NULL,
    plan_no        VARCHAR(64)    NOT NULL,
    line_no        INT            NOT NULL DEFAULT 1,
    line_status    VARCHAR(32)    NOT NULL DEFAULT 'OPEN',
    material_code  VARCHAR(64)    NOT NULL,
    material_name  VARCHAR(200),
    spec           VARCHAR(255),
    uom            VARCHAR(32)    NOT NULL DEFAULT 'PCS',
    demand_qty     DECIMAL(18, 6) NOT NULL DEFAULT 0,
    source_type    VARCHAR(32)    NOT NULL DEFAULT 'SALES',
    source_no      VARCHAR(64),
    customer_code  VARCHAR(64),
    demand_date    TIMESTAMP,
    warehouse_code VARCHAR(64),
    remark         VARCHAR(500),
    created_by     BIGINT,
    created_at     TIMESTAMP,
    updated_by     BIGINT,
    updated_at     TIMESTAMP,
    deleted        INT            NOT NULL DEFAULT 0,
    version        INT            NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE INDEX idx_erp_demand_plan_line_plan ON erp_demand_plan_line (plan_id);
CREATE INDEX idx_erp_demand_plan_line_no ON erp_demand_plan_line (plan_no);

-- ========== T095 ERP MRP/LRP 运算批次 ==========

CREATE TABLE erp_mrp_run (
    id              BIGINT         NOT NULL,
    run_no          VARCHAR(64)    NOT NULL,
    run_type        VARCHAR(32)    NOT NULL DEFAULT 'MRP',
    plan_no         VARCHAR(64),
    run_scope       VARCHAR(32)    NOT NULL DEFAULT 'ALL',
    run_date        TIMESTAMP,
    run_by          VARCHAR(128),
    demand_count    INT            NOT NULL DEFAULT 0,
    suggestion_count INT           NOT NULL DEFAULT 0,
    run_status      VARCHAR(32)    NOT NULL DEFAULT 'DRAFT',
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
CREATE UNIQUE INDEX uk_erp_mrp_run_no ON erp_mrp_run (run_no);
CREATE INDEX idx_erp_mrp_run_status ON erp_mrp_run (run_status);
CREATE INDEX idx_erp_mrp_run_plan ON erp_mrp_run (plan_no);

-- ========== T095 ERP 净需求（运算结果） ==========

CREATE TABLE erp_net_requirement (
    id               BIGINT         NOT NULL,
    requirement_no   VARCHAR(64)    NOT NULL,
    run_no           VARCHAR(64),
    material_code    VARCHAR(64)    NOT NULL,
    material_name    VARCHAR(200),
    spec             VARCHAR(255),
    uom              VARCHAR(32)    NOT NULL DEFAULT 'PCS',
    gross_qty        DECIMAL(18, 6) NOT NULL DEFAULT 0,
    on_hand_qty      DECIMAL(18, 6) NOT NULL DEFAULT 0,
    in_transit_qty   DECIMAL(18, 6) NOT NULL DEFAULT 0,
    allocated_qty    DECIMAL(18, 6) NOT NULL DEFAULT 0,
    safety_stock     DECIMAL(18, 6) NOT NULL DEFAULT 0,
    net_qty          DECIMAL(18, 6) NOT NULL DEFAULT 0,
    loss_rate        DECIMAL(9, 4)  NOT NULL DEFAULT 0,
    lead_time_days   INT            NOT NULL DEFAULT 0,
    required_date    TIMESTAMP,
    requirement_status VARCHAR(32)  NOT NULL DEFAULT 'OPEN',
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
CREATE UNIQUE INDEX uk_erp_net_requirement_no ON erp_net_requirement (requirement_no);
CREATE INDEX idx_erp_net_requirement_material ON erp_net_requirement (material_code);
CREATE INDEX idx_erp_net_requirement_status ON erp_net_requirement (requirement_status);
CREATE INDEX idx_erp_net_requirement_run ON erp_net_requirement (run_no);

-- ========== T095 ERP 采购建议 ==========

CREATE TABLE erp_purchase_suggestion (
    id                BIGINT         NOT NULL,
    suggestion_no     VARCHAR(64)    NOT NULL,
    run_no            VARCHAR(64),
    material_code     VARCHAR(64)    NOT NULL,
    material_name     VARCHAR(200),
    spec              VARCHAR(255),
    uom               VARCHAR(32)    NOT NULL DEFAULT 'PCS',
    net_qty           DECIMAL(18, 6) NOT NULL DEFAULT 0,
    suggest_qty       DECIMAL(18, 6) NOT NULL DEFAULT 0,
    suggested_supplier VARCHAR(200),
    suggested_price   DECIMAL(18, 4) NOT NULL DEFAULT 0,
    currency_code     VARCHAR(16)    NOT NULL DEFAULT 'CNY',
    required_date     TIMESTAMP,
    suggestion_status VARCHAR(32)    NOT NULL DEFAULT 'OPEN',
    org_id            BIGINT,
    org_name          VARCHAR(128),
    description       VARCHAR(1000),
    remark            VARCHAR(500),
    created_by        BIGINT,
    created_at        TIMESTAMP,
    updated_by        BIGINT,
    updated_at        TIMESTAMP,
    deleted           INT            NOT NULL DEFAULT 0,
    version           INT            NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_erp_purchase_suggestion_no ON erp_purchase_suggestion (suggestion_no);
CREATE INDEX idx_erp_purchase_suggestion_material ON erp_purchase_suggestion (material_code);
CREATE INDEX idx_erp_purchase_suggestion_status ON erp_purchase_suggestion (suggestion_status);
CREATE INDEX idx_erp_purchase_suggestion_run ON erp_purchase_suggestion (run_no);

-- ========== T095 ERP 生产建议 ==========

CREATE TABLE erp_production_suggestion (
    id                BIGINT         NOT NULL,
    suggestion_no     VARCHAR(64)    NOT NULL,
    run_no            VARCHAR(64),
    material_code     VARCHAR(64)    NOT NULL,
    material_name     VARCHAR(200),
    spec              VARCHAR(255),
    uom               VARCHAR(32)    NOT NULL DEFAULT 'PCS',
    net_qty           DECIMAL(18, 6) NOT NULL DEFAULT 0,
    suggest_qty       DECIMAL(18, 6) NOT NULL DEFAULT 0,
    bom_version       VARCHAR(64),
    warehouse_code    VARCHAR(64),
    required_date     TIMESTAMP,
    suggestion_status VARCHAR(32)    NOT NULL DEFAULT 'OPEN',
    org_id            BIGINT,
    org_name          VARCHAR(128),
    description       VARCHAR(1000),
    remark            VARCHAR(500),
    created_by        BIGINT,
    created_at        TIMESTAMP,
    updated_by        BIGINT,
    updated_at        TIMESTAMP,
    deleted           INT            NOT NULL DEFAULT 0,
    version           INT            NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_erp_production_suggestion_no ON erp_production_suggestion (suggestion_no);
CREATE INDEX idx_erp_production_suggestion_material ON erp_production_suggestion (material_code);
CREATE INDEX idx_erp_production_suggestion_status ON erp_production_suggestion (suggestion_status);
CREATE INDEX idx_erp_production_suggestion_run ON erp_production_suggestion (run_no);

-- ========== T025 ERP 计划调整 ==========

CREATE TABLE erp_plan_adjustment (
    id                BIGINT         NOT NULL,
    adjustment_no     VARCHAR(64)    NOT NULL,
    plan_no           VARCHAR(64),
    adjustment_type   VARCHAR(32)    NOT NULL DEFAULT 'DEMAND',
    material_code     VARCHAR(64)    NOT NULL,
    material_name     VARCHAR(200),
    spec              VARCHAR(255),
    uom               VARCHAR(32)    NOT NULL DEFAULT 'PCS',
    old_qty           DECIMAL(18, 6) NOT NULL DEFAULT 0,
    new_qty           DECIMAL(18, 6) NOT NULL DEFAULT 0,
    old_date          TIMESTAMP,
    new_date          TIMESTAMP,
    adjust_reason     VARCHAR(500),
    adjust_by         VARCHAR(128),
    adjust_date       TIMESTAMP,
    adjustment_status VARCHAR(32)    NOT NULL DEFAULT 'DRAFT',
    org_id            BIGINT,
    org_name          VARCHAR(128),
    description       VARCHAR(1000),
    remark            VARCHAR(500),
    created_by        BIGINT,
    created_at        TIMESTAMP,
    updated_by        BIGINT,
    updated_at        TIMESTAMP,
    deleted           INT            NOT NULL DEFAULT 0,
    version           INT            NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_erp_plan_adjustment_no ON erp_plan_adjustment (adjustment_no);
CREATE INDEX idx_erp_plan_adjustment_material ON erp_plan_adjustment (material_code);
CREATE INDEX idx_erp_plan_adjustment_status ON erp_plan_adjustment (adjustment_status);
CREATE INDEX idx_erp_plan_adjustment_plan ON erp_plan_adjustment (plan_no);
