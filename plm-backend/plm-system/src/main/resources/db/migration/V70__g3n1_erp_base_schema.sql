-- G3-N1 ERP—基础资料（对应总任务书 WBS T021，属 G3 ERP）。
-- 说明：SQL 同时兼容 PostgreSQL 与 H2（PostgreSQL 兼容模式），主键由应用侧雪花算法生成。
-- 设计原则：
--   1) 主数据权威源约束（见《主数据权责》表）：
--      「产品/零件/物料定义」权威源为 PLM，「供应商档案/准入」权威源为 SRM，
--      「客户/销售关系」权威源为 ERP，「组织/人员」权威源为统一身份平台，
--      「库存/库位/批次」权威源为 WMS。ERP 不得自造物料/供应商主档，
--      故本模块中物料、供应商均为「ERP 侧业务档案（扩展）」：以 PLM/SRM 下发的业务编码
--      (material_code / supplier_code) 作为业务键，仅维护 ERP 特有的经营属性
--      （计价方式、默认仓库/税率、采购/销售单位、结算方式、付款条件、安全库存等）。
--   2) 平台公共基础资料复用（不重复建表）：
--      部门（sys_organization）、仓库（sys_warehouse）、币种（sys_currency）、
--      税率（sys_tax_rate）已由 G1 公共平台底座提供，ERP 侧按编码引用，不另建主档。
--   3) 客户主档为 ERP 权威源，独立建表并支持多联系人；计量单位与单位换算为 ERP 基础资料，
--      供采购/销售/库存业务统一取用；项目档案用于费用归集与销售/采购项目核算。
-- 注意：
--   a) 业务字段一律不得命名为 version，避免与 BaseEntity 的乐观锁字段 version 冲突。
--   b) 各表业务编码（material_no/customer_no/supplier_no/uom_no/conversion_no/project_no/contact_no）
--      支持人工指定，且表上存在硬唯一索引；为与唯一索引保持一致，本模块删除语义为「释放编码」，
--      由服务层执行物理删除（与 G1-N1 及其后各节点同一处理方式）。

-- ========== T021 ERP 物料业务档案（权威源 PLM，本表为 ERP 侧扩展） ==========

CREATE TABLE erp_material (
    id                    BIGINT        NOT NULL,
    material_no           VARCHAR(64)   NOT NULL,
    material_code         VARCHAR(64)   NOT NULL,
    material_name         VARCHAR(200)  NOT NULL,
    spec                  VARCHAR(255),
    material_group        VARCHAR(64),
    base_uom              VARCHAR(32)   NOT NULL DEFAULT 'PCS',
    purchase_uom          VARCHAR(32),
    sale_uom              VARCHAR(32),
    valuation_method      VARCHAR(32)   NOT NULL DEFAULT 'MOVING_AVG',
    default_warehouse_code VARCHAR(64),
    default_tax_code      VARCHAR(64),
    safety_stock          DECIMAL(18, 6) NOT NULL DEFAULT 0,
    std_cost              DECIMAL(18, 4),
    material_status       VARCHAR(32)   NOT NULL DEFAULT 'ACTIVE',
    org_id                BIGINT,
    org_name              VARCHAR(128),
    description           VARCHAR(1000),
    remark                VARCHAR(500),
    created_by            BIGINT,
    created_at            TIMESTAMP,
    updated_by            BIGINT,
    updated_at            TIMESTAMP,
    deleted               INT           NOT NULL DEFAULT 0,
    version               INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_erp_material_no ON erp_material (material_no);
CREATE UNIQUE INDEX uk_erp_material_code ON erp_material (material_code);
CREATE INDEX idx_erp_material_group ON erp_material (material_group);
CREATE INDEX idx_erp_material_status ON erp_material (material_status);

-- ========== T021 ERP 客户档案（权威源 ERP） ==========

CREATE TABLE erp_customer (
    id            BIGINT        NOT NULL,
    customer_no   VARCHAR(64)   NOT NULL,
    customer_code VARCHAR(64)   NOT NULL,
    customer_name VARCHAR(200)  NOT NULL,
    short_name    VARCHAR(128),
    customer_type VARCHAR(32)   NOT NULL DEFAULT 'DIRECT',
    customer_group VARCHAR(64),
    sales_region  VARCHAR(64),
    credit_limit  DECIMAL(18, 4) NOT NULL DEFAULT 0,
    credit_days   INT           NOT NULL DEFAULT 0,
    settle_method VARCHAR(32)   NOT NULL DEFAULT 'TRANSFER',
    tax_code      VARCHAR(64),
    contact       VARCHAR(64),
    phone         VARCHAR(32),
    email         VARCHAR(128),
    address       VARCHAR(255),
    customer_status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    org_id        BIGINT,
    org_name      VARCHAR(128),
    description   VARCHAR(1000),
    remark        VARCHAR(500),
    created_by    BIGINT,
    created_at    TIMESTAMP,
    updated_by    BIGINT,
    updated_at    TIMESTAMP,
    deleted       INT           NOT NULL DEFAULT 0,
    version       INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_erp_customer_no ON erp_customer (customer_no);
CREATE UNIQUE INDEX uk_erp_customer_code ON erp_customer (customer_code);
CREATE INDEX idx_erp_customer_type ON erp_customer (customer_type);
CREATE INDEX idx_erp_customer_status ON erp_customer (customer_status);

-- ========== T021 ERP 客户联系人 ==========

CREATE TABLE erp_customer_contact (
    id             BIGINT       NOT NULL,
    contact_no     VARCHAR(64)  NOT NULL,
    customer_code  VARCHAR(64)  NOT NULL,
    contact_name   VARCHAR(128) NOT NULL,
    position_name  VARCHAR(128),
    phone          VARCHAR(32),
    email          VARCHAR(128),
    is_primary     INT          NOT NULL DEFAULT 0,
    contact_status VARCHAR(32)  NOT NULL DEFAULT 'ACTIVE',
    org_id         BIGINT,
    org_name       VARCHAR(128),
    description    VARCHAR(1000),
    remark         VARCHAR(500),
    created_by     BIGINT,
    created_at     TIMESTAMP,
    updated_by     BIGINT,
    updated_at     TIMESTAMP,
    deleted        INT          NOT NULL DEFAULT 0,
    version        INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_erp_customer_contact_no ON erp_customer_contact (contact_no);
CREATE INDEX idx_erp_customer_contact_cust ON erp_customer_contact (customer_code);

-- ========== T021 ERP 供应商业务档案（权威源 SRM，本表为 ERP 侧扩展） ==========

CREATE TABLE erp_supplier (
    id             BIGINT        NOT NULL,
    supplier_no    VARCHAR(64)   NOT NULL,
    supplier_code  VARCHAR(64)   NOT NULL,
    supplier_name  VARCHAR(200)  NOT NULL,
    short_name     VARCHAR(128),
    supplier_type  VARCHAR(32)   NOT NULL DEFAULT 'RAW',
    purchase_group VARCHAR(64),
    buyer_name     VARCHAR(64),
    settle_method  VARCHAR(32)   NOT NULL DEFAULT 'TRANSFER',
    payment_term   VARCHAR(32)   NOT NULL DEFAULT 'NET30',
    tax_code       VARCHAR(64),
    contact        VARCHAR(64),
    phone          VARCHAR(32),
    email          VARCHAR(128),
    address        VARCHAR(255),
    supplier_status VARCHAR(32)  NOT NULL DEFAULT 'ACTIVE',
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
CREATE UNIQUE INDEX uk_erp_supplier_no ON erp_supplier (supplier_no);
CREATE UNIQUE INDEX uk_erp_supplier_code ON erp_supplier (supplier_code);
CREATE INDEX idx_erp_supplier_type ON erp_supplier (supplier_type);
CREATE INDEX idx_erp_supplier_status ON erp_supplier (supplier_status);

-- ========== T021 ERP 计量单位 ==========

CREATE TABLE erp_uom (
    id               BIGINT       NOT NULL,
    uom_no           VARCHAR(64)  NOT NULL,
    uom_code         VARCHAR(32)  NOT NULL,
    uom_name         VARCHAR(128) NOT NULL,
    uom_type         VARCHAR(32)  NOT NULL DEFAULT 'BASE',
    precision_digits INT          NOT NULL DEFAULT 0,
    uom_status       VARCHAR(32)  NOT NULL DEFAULT 'ACTIVE',
    org_id           BIGINT,
    org_name         VARCHAR(128),
    description      VARCHAR(1000),
    remark           VARCHAR(500),
    created_by       BIGINT,
    created_at       TIMESTAMP,
    updated_by       BIGINT,
    updated_at       TIMESTAMP,
    deleted          INT          NOT NULL DEFAULT 0,
    version          INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_erp_uom_no ON erp_uom (uom_no);
CREATE UNIQUE INDEX uk_erp_uom_code ON erp_uom (uom_code);
CREATE INDEX idx_erp_uom_type ON erp_uom (uom_type);
CREATE INDEX idx_erp_uom_status ON erp_uom (uom_status);

-- ========== T021 ERP 计量单位换算 ==========

CREATE TABLE erp_uom_conversion (
    id               BIGINT         NOT NULL,
    conversion_no    VARCHAR(64)    NOT NULL,
    material_code    VARCHAR(64),
    from_uom         VARCHAR(32)    NOT NULL,
    to_uom           VARCHAR(32)    NOT NULL,
    conversion_rate  DECIMAL(18, 6) NOT NULL DEFAULT 1,
    conversion_status VARCHAR(32)   NOT NULL DEFAULT 'ACTIVE',
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
CREATE UNIQUE INDEX uk_erp_uom_conversion_no ON erp_uom_conversion (conversion_no);
CREATE INDEX idx_erp_uom_conversion_material ON erp_uom_conversion (material_code);
CREATE INDEX idx_erp_uom_conversion_status ON erp_uom_conversion (conversion_status);

-- ========== T021 ERP 项目档案 ==========

CREATE TABLE erp_project (
    id             BIGINT        NOT NULL,
    project_no     VARCHAR(64)   NOT NULL,
    project_code   VARCHAR(64),
    project_name   VARCHAR(200)  NOT NULL,
    project_type   VARCHAR(32)   NOT NULL DEFAULT 'INTERNAL',
    project_manager VARCHAR(128),
    customer_code  VARCHAR(64),
    start_date     TIMESTAMP,
    end_date       TIMESTAMP,
    budget_amount  DECIMAL(18, 4) NOT NULL DEFAULT 0,
    project_status VARCHAR(32)   NOT NULL DEFAULT 'PLANNING',
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
CREATE UNIQUE INDEX uk_erp_project_no ON erp_project (project_no);
CREATE INDEX idx_erp_project_type ON erp_project (project_type);
CREATE INDEX idx_erp_project_status ON erp_project (project_status);
CREATE INDEX idx_erp_project_customer ON erp_project (customer_code);
