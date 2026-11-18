-- G3-N4b ERP—生产管理（对应总任务书 WBS T026 生产管理、T096 生产订单与补料，属 G3 ERP）。
-- 说明：SQL 同时兼容 PostgreSQL 与 H2（PostgreSQL 兼容模式），主键由应用侧雪花算法生成。
-- 设计原则：
--   1) 主数据权责约束（见《主数据权责》表）：
--      「产品/零件/物料定义」权威源为 PLM，「BOM/工艺版本」权威源为 PLM，
--      「库存/库位/批次」权威源为 WMS，「组织/人员/角色」权威源为统一身份平台。
--      本模块仅登记生产订单、拆分、材料领用、补料与完工入库等生产业务单据，
--      物料以 PLM 下发的 material_code 作为业务键引用，BOM/工艺以版本号引用，不在此重复维护主档；
--      领料与完工入库的库存实绩由 WMS 承接（本模块登记指令与状态）。
--   2) 平台公共能力复用（不重复建表）：币种（sys_currency）、仓库（sys_warehouse）、
--      单据状态机（sys_doc_state_*）、审批（oa_process_*）由 G1 平台底座提供，ERP 侧按编码引用；
--      生产订单状态、领料状态、补料审批状态等业务语义字段在本模块内维护。
--   3) 单据编号规则：*_no 支持人工指定，未指定时由服务层按统一前缀自动生成；
--      生产主链：生产订单（erp_production_order）→ 订单拆分（erp_production_order_split）
--      → 子件调整（生产订单行 erp_production_order_line）→ 材料领用（erp_material_issue/_line）
--      → 补料（erp_material_addition）→ 完工入库（erp_completion_receipt）；
--      补料区分正常补料与超领补料（T096：支持超领原因和审批）。
-- 注意：
--   a) 业务字段一律不得命名为 version，避免与 BaseEntity 的乐观锁字段 version 冲突。
--   b) 具备业务编码唯一索引的单据表删除语义为「释放编码」，由服务层执行物理删除；
--      生产订单行、材料领用行无业务编码唯一索引，随头删除时逻辑删除即可。

-- ========== T026/T096 ERP 生产订单头 ==========

CREATE TABLE erp_production_order (
    id                 BIGINT         NOT NULL,
    order_no           VARCHAR(64)    NOT NULL,
    order_type         VARCHAR(32)    NOT NULL DEFAULT 'STANDARD',
    material_code      VARCHAR(64)    NOT NULL,
    material_name      VARCHAR(200),
    spec               VARCHAR(255),
    uom                VARCHAR(32)    NOT NULL DEFAULT 'PCS',
    plan_qty           DECIMAL(18, 6) NOT NULL DEFAULT 0,
    completed_qty      DECIMAL(18, 6) NOT NULL DEFAULT 0,
    scrap_qty          DECIMAL(18, 6) NOT NULL DEFAULT 0,
    order_status       VARCHAR(32)    NOT NULL DEFAULT 'DRAFT',
    plan_start_date    TIMESTAMP,
    plan_end_date      TIMESTAMP,
    actual_start_date  TIMESTAMP,
    actual_end_date    TIMESTAMP,
    workshop           VARCHAR(128),
    line_code          VARCHAR(64),
    bom_version        VARCHAR(64),
    routing_version    VARCHAR(64),
    source_type        VARCHAR(32)    NOT NULL DEFAULT 'MANUAL',
    source_no          VARCHAR(64),
    plan_no            VARCHAR(64),
    org_id             BIGINT,
    org_name           VARCHAR(128),
    description        VARCHAR(1000),
    remark             VARCHAR(500),
    created_by         BIGINT,
    created_at         TIMESTAMP,
    updated_by         BIGINT,
    updated_at         TIMESTAMP,
    deleted            INT            NOT NULL DEFAULT 0,
    version            INT            NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_erp_production_order_no ON erp_production_order (order_no);
CREATE INDEX idx_erp_production_order_status ON erp_production_order (order_status);
CREATE INDEX idx_erp_production_order_material ON erp_production_order (material_code);

-- ========== T026 ERP 生产订单行（子件，主子表：行，随头级联删除） ==========

CREATE TABLE erp_production_order_line (
    id             BIGINT         NOT NULL,
    order_id       BIGINT         NOT NULL,
    order_no       VARCHAR(64)    NOT NULL,
    line_no        INT            NOT NULL DEFAULT 1,
    line_status    VARCHAR(32)    NOT NULL DEFAULT 'OPEN',
    material_code  VARCHAR(64)    NOT NULL,
    material_name  VARCHAR(200),
    spec           VARCHAR(255),
    uom            VARCHAR(32)    NOT NULL DEFAULT 'PCS',
    required_qty   DECIMAL(18, 6) NOT NULL DEFAULT 0,
    issued_qty     DECIMAL(18, 6) NOT NULL DEFAULT 0,
    picked_qty     DECIMAL(18, 6) NOT NULL DEFAULT 0,
    remaining_qty  DECIMAL(18, 6) NOT NULL DEFAULT 0,
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
CREATE INDEX idx_erp_production_order_line_order ON erp_production_order_line (order_id);
CREATE INDEX idx_erp_production_order_line_no ON erp_production_order_line (order_no);

-- ========== T026 ERP 生产订单拆分 ==========

CREATE TABLE erp_production_order_split (
    id               BIGINT         NOT NULL,
    split_no         VARCHAR(64)    NOT NULL,
    source_order_id  BIGINT,
    source_order_no  VARCHAR(64),
    target_order_id  BIGINT,
    target_order_no  VARCHAR(64),
    split_qty        DECIMAL(18, 6) NOT NULL DEFAULT 0,
    split_type       VARCHAR(32)    NOT NULL DEFAULT 'QTY',
    split_reason     VARCHAR(500),
    split_by         VARCHAR(128),
    split_date       TIMESTAMP,
    split_status     VARCHAR(32)    NOT NULL DEFAULT 'DRAFT',
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
CREATE UNIQUE INDEX uk_erp_production_order_split_no ON erp_production_order_split (split_no);
CREATE INDEX idx_erp_production_order_split_source ON erp_production_order_split (source_order_no);
CREATE INDEX idx_erp_production_order_split_status ON erp_production_order_split (split_status);

-- ========== T096 ERP 材料领用头 ==========

CREATE TABLE erp_material_issue (
    id           BIGINT         NOT NULL,
    issue_no     VARCHAR(64)    NOT NULL,
    order_no     VARCHAR(64),
    workshop     VARCHAR(128),
    issue_by     VARCHAR(128),
    issue_date   TIMESTAMP,
    total_qty    DECIMAL(18, 6) NOT NULL DEFAULT 0,
    issue_status VARCHAR(32)    NOT NULL DEFAULT 'DRAFT',
    org_id       BIGINT,
    org_name     VARCHAR(128),
    description  VARCHAR(1000),
    remark       VARCHAR(500),
    created_by   BIGINT,
    created_at   TIMESTAMP,
    updated_by   BIGINT,
    updated_at   TIMESTAMP,
    deleted      INT            NOT NULL DEFAULT 0,
    version      INT            NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_erp_material_issue_no ON erp_material_issue (issue_no);
CREATE INDEX idx_erp_material_issue_order ON erp_material_issue (order_no);
CREATE INDEX idx_erp_material_issue_status ON erp_material_issue (issue_status);

-- ========== T096 ERP 材料领用行（主子表：行，随头级联删除） ==========

CREATE TABLE erp_material_issue_line (
    id             BIGINT         NOT NULL,
    issue_id       BIGINT         NOT NULL,
    issue_no       VARCHAR(64)    NOT NULL,
    line_no        INT            NOT NULL DEFAULT 1,
    line_status    VARCHAR(32)    NOT NULL DEFAULT 'OPEN',
    material_code  VARCHAR(64)    NOT NULL,
    material_name  VARCHAR(200),
    spec           VARCHAR(255),
    uom            VARCHAR(32)    NOT NULL DEFAULT 'PCS',
    issue_qty      DECIMAL(18, 6) NOT NULL DEFAULT 0,
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
CREATE INDEX idx_erp_material_issue_line_issue ON erp_material_issue_line (issue_id);
CREATE INDEX idx_erp_material_issue_line_no ON erp_material_issue_line (issue_no);

-- ========== T096 ERP 生产补料（支持超领原因和审批） ==========

CREATE TABLE erp_material_addition (
    id                BIGINT         NOT NULL,
    addition_no       VARCHAR(64)    NOT NULL,
    order_no          VARCHAR(64),
    addition_type     VARCHAR(32)    NOT NULL DEFAULT 'NORMAL',
    material_code     VARCHAR(64)    NOT NULL,
    material_name     VARCHAR(200),
    spec              VARCHAR(255),
    uom               VARCHAR(32)    NOT NULL DEFAULT 'PCS',
    addition_qty      DECIMAL(18, 6) NOT NULL DEFAULT 0,
    addition_reason   VARCHAR(500),
    over_issue_reason VARCHAR(500),
    approval_status   VARCHAR(32)    NOT NULL DEFAULT 'PENDING',
    addition_by       VARCHAR(128),
    addition_date     TIMESTAMP,
    addition_status   VARCHAR(32)    NOT NULL DEFAULT 'DRAFT',
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
CREATE UNIQUE INDEX uk_erp_material_addition_no ON erp_material_addition (addition_no);
CREATE INDEX idx_erp_material_addition_order ON erp_material_addition (order_no);
CREATE INDEX idx_erp_material_addition_status ON erp_material_addition (addition_status);
CREATE INDEX idx_erp_material_addition_type ON erp_material_addition (addition_type);

-- ========== T026/T096 ERP 完工入库单 ==========

CREATE TABLE erp_completion_receipt (
    id                  BIGINT         NOT NULL,
    receipt_no          VARCHAR(64)    NOT NULL,
    order_no            VARCHAR(64),
    material_code       VARCHAR(64)    NOT NULL,
    material_name       VARCHAR(200),
    spec                VARCHAR(255),
    uom                 VARCHAR(32)    NOT NULL DEFAULT 'PCS',
    completed_qty       DECIMAL(18, 6) NOT NULL DEFAULT 0,
    scrap_qty           DECIMAL(18, 6) NOT NULL DEFAULT 0,
    warehouse_code      VARCHAR(64),
    receipt_date        TIMESTAMP,
    inspection_required INT            NOT NULL DEFAULT 0,
    inspection_status   VARCHAR(32)    NOT NULL DEFAULT 'PENDING',
    receipt_status      VARCHAR(32)    NOT NULL DEFAULT 'DRAFT',
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
CREATE UNIQUE INDEX uk_erp_completion_receipt_no ON erp_completion_receipt (receipt_no);
CREATE INDEX idx_erp_completion_receipt_order ON erp_completion_receipt (order_no);
CREATE INDEX idx_erp_completion_receipt_status ON erp_completion_receipt (receipt_status);
