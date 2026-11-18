-- G3-N2 ERP—销售管理（对应总任务书 WBS T022 销售管理、T092 销售订单到发货，属 G3 ERP）。
-- 说明：SQL 同时兼容 PostgreSQL 与 H2（PostgreSQL 兼容模式），主键由应用侧雪花算法生成。
-- 设计原则：
--   1) 主数据权责约束（见《主数据权责》表）：
--      「客户/销售关系」权威源为 ERP，「产品/零件/物料定义」权威源为 PLM，
--      「库存/库位/批次」权威源为 WMS。本模块仅登记销售业务单据，
--      物料以 PLM 下发的 material_code、客户以 ERP 客户档案的 customer_code 作为业务键引用，
--      不在此重复维护主档；出入库实绩由 WMS 承接（本模块登记出库指令与状态）。
--   2) 平台公共能力复用（不重复建表）：币种（sys_currency）、税率（sys_tax_rate）、
--      仓库（sys_warehouse）、单据状态机（sys_doc_state_*）、审批（oa_process_*）由 G1 平台底座提供，
--      ERP 侧按编码引用；销售订单状态、发货单状态等业务语义字段在本模块内维护。
--   3) 单据编号规则：*_no 支持人工指定，未指定时由服务层按统一前缀自动生成；
--      客户订单可分批交付（订单行 delivered_qty / remaining_qty 与发货单行一一对应），
--      交期评审（erp_delivery_review）承接客户要求交期与承诺交期；
--      订单变更（erp_order_change）记录数量/交期/价格/取消等变更轨迹；
--      销售发票（erp_sales_invoice）与应收账款（erp_sales_receivable）为财务业务接口凭证。
-- 注意：
--   a) 业务字段一律不得命名为 version，避免与 BaseEntity 的乐观锁字段 version 冲突。
--   b) 具备业务编码唯一索引的单据表（erp_sales_forecast / erp_sales_order / erp_order_change /
--      erp_delivery_review / erp_delivery_order / erp_sales_outbound / erp_sales_return /
--      erp_sales_invoice / erp_sales_receivable）删除语义为「释放编码」，由服务层执行物理删除；
--      销售订单行、发货单行无业务编码唯一索引，随头删除时逻辑删除即可。

-- ========== T022 ERP 销售预测 ==========

CREATE TABLE erp_sales_forecast (
    id               BIGINT         NOT NULL,
    forecast_no      VARCHAR(64)    NOT NULL,
    customer_code    VARCHAR(64),
    customer_name    VARCHAR(200),
    material_code    VARCHAR(64)    NOT NULL,
    material_name    VARCHAR(200),
    spec             VARCHAR(255),
    forecast_period  VARCHAR(16),
    forecast_date    TIMESTAMP,
    forecast_qty     DECIMAL(18, 6) NOT NULL DEFAULT 0,
    forecast_type    VARCHAR(32)    NOT NULL DEFAULT 'MONTHLY',
    forecast_status  VARCHAR(32)    NOT NULL DEFAULT 'OPEN',
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
CREATE UNIQUE INDEX uk_erp_sales_forecast_no ON erp_sales_forecast (forecast_no);
CREATE INDEX idx_erp_sales_forecast_customer ON erp_sales_forecast (customer_code);
CREATE INDEX idx_erp_sales_forecast_material ON erp_sales_forecast (material_code);
CREATE INDEX idx_erp_sales_forecast_status ON erp_sales_forecast (forecast_status);

-- ========== T022/T092 ERP 销售订单头 ==========

CREATE TABLE erp_sales_order (
    id                BIGINT         NOT NULL,
    order_no          VARCHAR(64)    NOT NULL,
    order_type        VARCHAR(32)    NOT NULL DEFAULT 'STANDARD',
    customer_code     VARCHAR(64)    NOT NULL,
    customer_name     VARCHAR(200),
    sales_region      VARCHAR(64),
    salesperson       VARCHAR(128),
    project_code      VARCHAR(64),
    order_date        TIMESTAMP,
    delivery_date     TIMESTAMP,
    currency_code     VARCHAR(16)    NOT NULL DEFAULT 'CNY',
    exchange_rate     DECIMAL(18, 6) NOT NULL DEFAULT 1,
    tax_code          VARCHAR(64),
    payment_term      VARCHAR(32)    NOT NULL DEFAULT 'NET30',
    settle_method     VARCHAR(32)    NOT NULL DEFAULT 'TRANSFER',
    credit_status     VARCHAR(32)    NOT NULL DEFAULT 'OK',
    review_status     VARCHAR(32)    NOT NULL DEFAULT 'PENDING',
    order_status      VARCHAR(32)    NOT NULL DEFAULT 'DRAFT',
    total_amount      DECIMAL(18, 4) NOT NULL DEFAULT 0,
    tax_amount        DECIMAL(18, 4) NOT NULL DEFAULT 0,
    net_amount        DECIMAL(18, 4) NOT NULL DEFAULT 0,
    delivered_amount  DECIMAL(18, 4) NOT NULL DEFAULT 0,
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
CREATE UNIQUE INDEX uk_erp_sales_order_no ON erp_sales_order (order_no);
CREATE INDEX idx_erp_sales_order_customer ON erp_sales_order (customer_code);
CREATE INDEX idx_erp_sales_order_status ON erp_sales_order (order_status);
CREATE INDEX idx_erp_sales_order_review ON erp_sales_order (review_status);

-- ========== T022/T092 ERP 销售订单行（主子表：行，随头级联删除） ==========

CREATE TABLE erp_sales_order_line (
    id             BIGINT         NOT NULL,
    order_id       BIGINT         NOT NULL,
    order_no       VARCHAR(64)    NOT NULL,
    line_no        INT            NOT NULL DEFAULT 1,
    line_status    VARCHAR(32)    NOT NULL DEFAULT 'OPEN',
    material_code  VARCHAR(64)    NOT NULL,
    material_name  VARCHAR(200),
    spec           VARCHAR(255),
    uom            VARCHAR(32)    NOT NULL DEFAULT 'PCS',
    order_qty      DECIMAL(18, 6) NOT NULL DEFAULT 0,
    delivered_qty  DECIMAL(18, 6) NOT NULL DEFAULT 0,
    remaining_qty  DECIMAL(18, 6) NOT NULL DEFAULT 0,
    unit_price     DECIMAL(18, 4) NOT NULL DEFAULT 0,
    tax_rate       DECIMAL(9, 4)  NOT NULL DEFAULT 0,
    amount         DECIMAL(18, 4) NOT NULL DEFAULT 0,
    delivery_date  TIMESTAMP,
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
CREATE INDEX idx_erp_sales_order_line_order ON erp_sales_order_line (order_id);
CREATE INDEX idx_erp_sales_order_line_no ON erp_sales_order_line (order_no);

-- ========== T092 ERP 订单变更 ==========

CREATE TABLE erp_order_change (
    id            BIGINT       NOT NULL,
    change_no     VARCHAR(64)  NOT NULL,
    order_no      VARCHAR(64)  NOT NULL,
    order_line_no INT,
    change_type   VARCHAR(32)  NOT NULL DEFAULT 'QUANTITY',
    change_reason VARCHAR(500),
    before_value  VARCHAR(255),
    after_value   VARCHAR(255),
    applicant     VARCHAR(128),
    apply_date    TIMESTAMP,
    change_status VARCHAR(32)  NOT NULL DEFAULT 'DRAFT',
    org_id        BIGINT,
    org_name      VARCHAR(128),
    description   VARCHAR(1000),
    remark        VARCHAR(500),
    created_by    BIGINT,
    created_at    TIMESTAMP,
    updated_by    BIGINT,
    updated_at    TIMESTAMP,
    deleted       INT          NOT NULL DEFAULT 0,
    version       INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_erp_order_change_no ON erp_order_change (change_no);
CREATE INDEX idx_erp_order_change_order ON erp_order_change (order_no);
CREATE INDEX idx_erp_order_change_status ON erp_order_change (change_status);

-- ========== T022/T092 ERP 交期评审 ==========

CREATE TABLE erp_delivery_review (
    id                    BIGINT       NOT NULL,
    review_no             VARCHAR(64)  NOT NULL,
    order_no              VARCHAR(64)  NOT NULL,
    order_line_no         INT,
    material_code         VARCHAR(64),
    material_name         VARCHAR(200),
    customer_request_date TIMESTAMP,
    promised_date         TIMESTAMP,
    review_result         VARCHAR(32)  NOT NULL DEFAULT 'PENDING',
    review_opinion        VARCHAR(1000),
    reviewer              VARCHAR(128),
    review_date           TIMESTAMP,
    review_status         VARCHAR(32)  NOT NULL DEFAULT 'OPEN',
    org_id                BIGINT,
    org_name              VARCHAR(128),
    description           VARCHAR(1000),
    remark                VARCHAR(500),
    created_by            BIGINT,
    created_at            TIMESTAMP,
    updated_by            BIGINT,
    updated_at            TIMESTAMP,
    deleted               INT          NOT NULL DEFAULT 0,
    version               INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_erp_delivery_review_no ON erp_delivery_review (review_no);
CREATE INDEX idx_erp_delivery_review_order ON erp_delivery_review (order_no);
CREATE INDEX idx_erp_delivery_review_result ON erp_delivery_review (review_result);

-- ========== T092 ERP 发货单头 ==========

CREATE TABLE erp_delivery_order (
    id              BIGINT         NOT NULL,
    delivery_no     VARCHAR(64)    NOT NULL,
    delivery_type   VARCHAR(32)    NOT NULL DEFAULT 'NORMAL',
    order_no        VARCHAR(64)    NOT NULL,
    customer_code   VARCHAR(64)    NOT NULL,
    customer_name   VARCHAR(200),
    delivery_date   TIMESTAMP,
    warehouse_code  VARCHAR(64),
    receiver_address VARCHAR(255),
    contact         VARCHAR(64),
    phone           VARCHAR(32),
    carrier         VARCHAR(128),
    tracking_no     VARCHAR(128),
    delivery_status VARCHAR(32)    NOT NULL DEFAULT 'DRAFT',
    total_qty       DECIMAL(18, 6) NOT NULL DEFAULT 0,
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
CREATE UNIQUE INDEX uk_erp_delivery_order_no ON erp_delivery_order (delivery_no);
CREATE INDEX idx_erp_delivery_order_order ON erp_delivery_order (order_no);
CREATE INDEX idx_erp_delivery_order_customer ON erp_delivery_order (customer_code);
CREATE INDEX idx_erp_delivery_order_status ON erp_delivery_order (delivery_status);

-- ========== T092 ERP 发货单行（主子表：行，随头级联删除） ==========

CREATE TABLE erp_delivery_order_line (
    id             BIGINT         NOT NULL,
    delivery_id    BIGINT         NOT NULL,
    delivery_no    VARCHAR(64)    NOT NULL,
    line_no        INT            NOT NULL DEFAULT 1,
    order_no       VARCHAR(64),
    order_line_no  INT,
    material_code  VARCHAR(64)    NOT NULL,
    material_name  VARCHAR(200),
    spec           VARCHAR(255),
    uom            VARCHAR(32)    NOT NULL DEFAULT 'PCS',
    delivery_qty   DECIMAL(18, 6) NOT NULL DEFAULT 0,
    batch_no       VARCHAR(64),
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
CREATE INDEX idx_erp_delivery_order_line_delivery ON erp_delivery_order_line (delivery_id);
CREATE INDEX idx_erp_delivery_order_line_no ON erp_delivery_order_line (delivery_no);

-- ========== T092 ERP 销售出库 ==========

CREATE TABLE erp_sales_outbound (
    id              BIGINT         NOT NULL,
    outbound_no     VARCHAR(64)    NOT NULL,
    delivery_no     VARCHAR(64),
    order_no        VARCHAR(64),
    customer_code   VARCHAR(64),
    warehouse_code  VARCHAR(64),
    outbound_date   TIMESTAMP,
    outbound_qty    DECIMAL(18, 6) NOT NULL DEFAULT 0,
    batch_no        VARCHAR(64),
    operator_name   VARCHAR(64),
    outbound_status VARCHAR(32)    NOT NULL DEFAULT 'DRAFT',
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
CREATE UNIQUE INDEX uk_erp_sales_outbound_no ON erp_sales_outbound (outbound_no);
CREATE INDEX idx_erp_sales_outbound_delivery ON erp_sales_outbound (delivery_no);
CREATE INDEX idx_erp_sales_outbound_order ON erp_sales_outbound (order_no);
CREATE INDEX idx_erp_sales_outbound_status ON erp_sales_outbound (outbound_status);

-- ========== T022/T092 ERP 销售退货 ==========

CREATE TABLE erp_sales_return (
    id             BIGINT         NOT NULL,
    return_no      VARCHAR(64)    NOT NULL,
    order_no       VARCHAR(64),
    delivery_no    VARCHAR(64),
    customer_code  VARCHAR(64)    NOT NULL,
    customer_name  VARCHAR(200),
    material_code  VARCHAR(64)    NOT NULL,
    material_name  VARCHAR(200),
    return_date    TIMESTAMP,
    return_qty     DECIMAL(18, 6) NOT NULL DEFAULT 0,
    return_reason  VARCHAR(500),
    return_amount  DECIMAL(18, 4) NOT NULL DEFAULT 0,
    warehouse_code VARCHAR(64),
    return_status  VARCHAR(32)    NOT NULL DEFAULT 'DRAFT',
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
CREATE UNIQUE INDEX uk_erp_sales_return_no ON erp_sales_return (return_no);
CREATE INDEX idx_erp_sales_return_order ON erp_sales_return (order_no);
CREATE INDEX idx_erp_sales_return_customer ON erp_sales_return (customer_code);
CREATE INDEX idx_erp_sales_return_status ON erp_sales_return (return_status);

-- ========== T022 ERP 销售发票（财务业务接口凭证） ==========

CREATE TABLE erp_sales_invoice (
    id             BIGINT         NOT NULL,
    invoice_no     VARCHAR(64)    NOT NULL,
    invoice_type   VARCHAR(32)    NOT NULL DEFAULT 'SPECIAL',
    invoice_code   VARCHAR(64),
    order_no       VARCHAR(64),
    delivery_no    VARCHAR(64),
    customer_code  VARCHAR(64)    NOT NULL,
    customer_name  VARCHAR(200),
    invoice_date   TIMESTAMP,
    invoice_amount DECIMAL(18, 4) NOT NULL DEFAULT 0,
    tax_rate       DECIMAL(9, 4)  NOT NULL DEFAULT 0,
    tax_amount     DECIMAL(18, 4) NOT NULL DEFAULT 0,
    net_amount     DECIMAL(18, 4) NOT NULL DEFAULT 0,
    invoice_status VARCHAR(32)    NOT NULL DEFAULT 'DRAFT',
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
CREATE UNIQUE INDEX uk_erp_sales_invoice_no ON erp_sales_invoice (invoice_no);
CREATE INDEX idx_erp_sales_invoice_order ON erp_sales_invoice (order_no);
CREATE INDEX idx_erp_sales_invoice_customer ON erp_sales_invoice (customer_code);
CREATE INDEX idx_erp_sales_invoice_status ON erp_sales_invoice (invoice_status);

-- ========== T022 ERP 应收账款（财务业务接口凭证） ==========

CREATE TABLE erp_sales_receivable (
    id               BIGINT         NOT NULL,
    ar_no            VARCHAR(64)    NOT NULL,
    invoice_no       VARCHAR(64),
    order_no         VARCHAR(64),
    customer_code    VARCHAR(64)    NOT NULL,
    customer_name    VARCHAR(200),
    ar_amount        DECIMAL(18, 4) NOT NULL DEFAULT 0,
    received_amount  DECIMAL(18, 4) NOT NULL DEFAULT 0,
    ar_balance       DECIMAL(18, 4) NOT NULL DEFAULT 0,
    due_date         TIMESTAMP,
    ar_status        VARCHAR(32)    NOT NULL DEFAULT 'OPEN',
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
CREATE UNIQUE INDEX uk_erp_sales_receivable_no ON erp_sales_receivable (ar_no);
CREATE INDEX idx_erp_sales_receivable_invoice ON erp_sales_receivable (invoice_no);
CREATE INDEX idx_erp_sales_receivable_customer ON erp_sales_receivable (customer_code);
CREATE INDEX idx_erp_sales_receivable_status ON erp_sales_receivable (ar_status);
