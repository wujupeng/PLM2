-- G3-N3a ERP—采购管理（对应总任务书 WBS T023 采购管理、T093 采购到货入库，属 G3 ERP）。
-- 说明：SQL 同时兼容 PostgreSQL 与 H2（PostgreSQL 兼容模式），主键由应用侧雪花算法生成。
-- 设计原则：
--   1) 主数据权责约束（见《主数据权责》表）：
--      「供应商档案/准入」权威源为 SRM，「产品/零件/物料定义」权威源为 PLM，
--      「库存/库位/批次」权威源为 WMS。本模块仅登记采购业务单据，
--      物料以 PLM 下发的 material_code、供应商以 SRM/ERP 供应商档案的 supplier_code 作为业务键引用，
--      不在此重复维护主档；到货入库实绩由 WMS 承接（本模块登记到货/报检/入库指令与状态）。
--   2) 平台公共能力复用（不重复建表）：币种（sys_currency）、税率（sys_tax_rate）、
--      仓库（sys_warehouse）、单据状态机（sys_doc_state_*）、审批（oa_process_*）由 G1 平台底座提供，
--      ERP 侧按编码引用；采购订单状态、到货单状态等业务语义字段在本模块内维护。
--   3) 单据编号规则：*_no 支持人工指定，未指定时由服务层按统一前缀自动生成；
--      采购主链：请购（erp_purchase_requisition）→ 询价（erp_purchase_inquiry）→
--      采购订单（erp_purchase_order）→ 到货（erp_goods_receipt）→ 报检/检验（erp_purchase_inspection）
--      → 采购入库（erp_purchase_inbound）→ 采购发票（erp_purchase_invoice）→ 采购结算（erp_purchase_settlement）；
--      区分免检与检验物料：到货单头 inspection_required 标识是否需报检，检验单记录合格/不合格数量；
--      采购退货（erp_purchase_return）承接不合格或商务退货。
-- 注意：
--   a) 业务字段一律不得命名为 version，避免与 BaseEntity 的乐观锁字段 version 冲突。
--   b) 具备业务编码唯一索引的单据表删除语义为「释放编码」，由服务层执行物理删除；
--      请购单行、采购订单行、到货单行无业务编码唯一索引，随头删除时逻辑删除即可。

-- ========== T023/T093 ERP 请购单头 ==========

CREATE TABLE erp_purchase_requisition (
    id               BIGINT         NOT NULL,
    requisition_no   VARCHAR(64)    NOT NULL,
    requisition_type VARCHAR(32)    NOT NULL DEFAULT 'NORMAL',
    req_org          VARCHAR(128),
    applicant        VARCHAR(128),
    apply_date       TIMESTAMP,
    required_date    TIMESTAMP,
    currency_code    VARCHAR(16)    NOT NULL DEFAULT 'CNY',
    source_type      VARCHAR(32)    NOT NULL DEFAULT 'MANUAL',
    requisition_status VARCHAR(32)  NOT NULL DEFAULT 'DRAFT',
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
CREATE UNIQUE INDEX uk_erp_purchase_requisition_no ON erp_purchase_requisition (requisition_no);
CREATE INDEX idx_erp_purchase_requisition_status ON erp_purchase_requisition (requisition_status);
CREATE INDEX idx_erp_purchase_requisition_org ON erp_purchase_requisition (req_org);

-- ========== T023/T093 ERP 请购单行（主子表：行，随头级联删除） ==========

CREATE TABLE erp_purchase_requisition_line (
    id                BIGINT         NOT NULL,
    requisition_id    BIGINT         NOT NULL,
    requisition_no    VARCHAR(64)    NOT NULL,
    line_no           INT            NOT NULL DEFAULT 1,
    line_status       VARCHAR(32)    NOT NULL DEFAULT 'OPEN',
    material_code     VARCHAR(64)    NOT NULL,
    material_name     VARCHAR(200),
    spec              VARCHAR(255),
    uom               VARCHAR(32)    NOT NULL DEFAULT 'PCS',
    req_qty           DECIMAL(18, 6) NOT NULL DEFAULT 0,
    ordered_qty       DECIMAL(18, 6) NOT NULL DEFAULT 0,
    remaining_qty     DECIMAL(18, 6) NOT NULL DEFAULT 0,
    req_date          TIMESTAMP,
    suggested_supplier VARCHAR(200),
    warehouse_code    VARCHAR(64),
    remark            VARCHAR(500),
    created_by        BIGINT,
    created_at        TIMESTAMP,
    updated_by        BIGINT,
    updated_at        TIMESTAMP,
    deleted           INT            NOT NULL DEFAULT 0,
    version           INT            NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE INDEX idx_erp_purchase_requisition_line_req ON erp_purchase_requisition_line (requisition_id);
CREATE INDEX idx_erp_purchase_requisition_line_no ON erp_purchase_requisition_line (requisition_no);

-- ========== T023 ERP 采购询价单 ==========

CREATE TABLE erp_purchase_inquiry (
    id             BIGINT         NOT NULL,
    inquiry_no     VARCHAR(64)    NOT NULL,
    material_code  VARCHAR(64)    NOT NULL,
    material_name  VARCHAR(200),
    spec           VARCHAR(255),
    uom            VARCHAR(32)    NOT NULL DEFAULT 'PCS',
    inquiry_qty    DECIMAL(18, 6) NOT NULL DEFAULT 0,
    inquiry_date   TIMESTAMP,
    quote_deadline TIMESTAMP,
    supplier_code  VARCHAR(64),
    supplier_name  VARCHAR(200),
    quote_price    DECIMAL(18, 4) NOT NULL DEFAULT 0,
    currency_code  VARCHAR(16)    NOT NULL DEFAULT 'CNY',
    quote_date     TIMESTAMP,
    valid_until    TIMESTAMP,
    inquiry_status VARCHAR(32)    NOT NULL DEFAULT 'DRAFT',
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
CREATE UNIQUE INDEX uk_erp_purchase_inquiry_no ON erp_purchase_inquiry (inquiry_no);
CREATE INDEX idx_erp_purchase_inquiry_material ON erp_purchase_inquiry (material_code);
CREATE INDEX idx_erp_purchase_inquiry_status ON erp_purchase_inquiry (inquiry_status);

-- ========== T023/T093 ERP 采购订单头 ==========

CREATE TABLE erp_purchase_order (
    id             BIGINT         NOT NULL,
    order_no       VARCHAR(64)    NOT NULL,
    order_type     VARCHAR(32)    NOT NULL DEFAULT 'STANDARD',
    supplier_code  VARCHAR(64)    NOT NULL,
    supplier_name  VARCHAR(200),
    buyer_name     VARCHAR(128),
    purchase_group VARCHAR(64),
    order_date     TIMESTAMP,
    required_date  TIMESTAMP,
    currency_code  VARCHAR(16)    NOT NULL DEFAULT 'CNY',
    exchange_rate  DECIMAL(18, 6) NOT NULL DEFAULT 1,
    tax_code       VARCHAR(64),
    payment_term   VARCHAR(32)    NOT NULL DEFAULT 'NET30',
    settle_method  VARCHAR(32)    NOT NULL DEFAULT 'TRANSFER',
    review_status  VARCHAR(32)    NOT NULL DEFAULT 'PENDING',
    order_status   VARCHAR(32)    NOT NULL DEFAULT 'DRAFT',
    total_amount   DECIMAL(18, 4) NOT NULL DEFAULT 0,
    tax_amount     DECIMAL(18, 4) NOT NULL DEFAULT 0,
    net_amount     DECIMAL(18, 4) NOT NULL DEFAULT 0,
    received_amount DECIMAL(18, 4) NOT NULL DEFAULT 0,
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
CREATE UNIQUE INDEX uk_erp_purchase_order_no ON erp_purchase_order (order_no);
CREATE INDEX idx_erp_purchase_order_supplier ON erp_purchase_order (supplier_code);
CREATE INDEX idx_erp_purchase_order_status ON erp_purchase_order (order_status);
CREATE INDEX idx_erp_purchase_order_review ON erp_purchase_order (review_status);

-- ========== T023/T093 ERP 采购订单行（主子表：行，随头级联删除） ==========

CREATE TABLE erp_purchase_order_line (
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
    received_qty   DECIMAL(18, 6) NOT NULL DEFAULT 0,
    remaining_qty  DECIMAL(18, 6) NOT NULL DEFAULT 0,
    unit_price     DECIMAL(18, 4) NOT NULL DEFAULT 0,
    tax_rate       DECIMAL(9, 4)  NOT NULL DEFAULT 0,
    amount         DECIMAL(18, 4) NOT NULL DEFAULT 0,
    required_date  TIMESTAMP,
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
CREATE INDEX idx_erp_purchase_order_line_order ON erp_purchase_order_line (order_id);
CREATE INDEX idx_erp_purchase_order_line_no ON erp_purchase_order_line (order_no);

-- ========== T093 ERP 采购到货单头 ==========

CREATE TABLE erp_goods_receipt (
    id                  BIGINT         NOT NULL,
    receipt_no          VARCHAR(64)    NOT NULL,
    receipt_type        VARCHAR(32)    NOT NULL DEFAULT 'NORMAL',
    order_no            VARCHAR(64),
    supplier_code       VARCHAR(64)    NOT NULL,
    supplier_name       VARCHAR(200),
    receipt_date        TIMESTAMP,
    warehouse_code      VARCHAR(64),
    inspection_required INT            NOT NULL DEFAULT 1,
    receiver            VARCHAR(128),
    receipt_status      VARCHAR(32)    NOT NULL DEFAULT 'DRAFT',
    total_qty           DECIMAL(18, 6) NOT NULL DEFAULT 0,
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
CREATE UNIQUE INDEX uk_erp_goods_receipt_no ON erp_goods_receipt (receipt_no);
CREATE INDEX idx_erp_goods_receipt_order ON erp_goods_receipt (order_no);
CREATE INDEX idx_erp_goods_receipt_supplier ON erp_goods_receipt (supplier_code);
CREATE INDEX idx_erp_goods_receipt_status ON erp_goods_receipt (receipt_status);

-- ========== T093 ERP 采购到货行（主子表：行，随头级联删除） ==========

CREATE TABLE erp_goods_receipt_line (
    id                BIGINT         NOT NULL,
    receipt_id        BIGINT         NOT NULL,
    receipt_no        VARCHAR(64)    NOT NULL,
    line_no           INT            NOT NULL DEFAULT 1,
    order_no          VARCHAR(64),
    order_line_no     INT,
    material_code     VARCHAR(64)    NOT NULL,
    material_name     VARCHAR(200),
    spec              VARCHAR(255),
    uom               VARCHAR(32)    NOT NULL DEFAULT 'PCS',
    receipt_qty       DECIMAL(18, 6) NOT NULL DEFAULT 0,
    batch_no          VARCHAR(64),
    warehouse_code    VARCHAR(64),
    inspection_result VARCHAR(32)    NOT NULL DEFAULT 'PENDING',
    remark            VARCHAR(500),
    created_by        BIGINT,
    created_at        TIMESTAMP,
    updated_by        BIGINT,
    updated_at        TIMESTAMP,
    deleted           INT            NOT NULL DEFAULT 0,
    version           INT            NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE INDEX idx_erp_goods_receipt_line_receipt ON erp_goods_receipt_line (receipt_id);
CREATE INDEX idx_erp_goods_receipt_line_no ON erp_goods_receipt_line (receipt_no);

-- ========== T093 ERP 采购报检/检验单（区分免检与检验物料） ==========

CREATE TABLE erp_purchase_inspection (
    id               BIGINT         NOT NULL,
    inspection_no    VARCHAR(64)    NOT NULL,
    receipt_no       VARCHAR(64),
    order_no         VARCHAR(64),
    material_code    VARCHAR(64)    NOT NULL,
    material_name    VARCHAR(200),
    inspection_type  VARCHAR(32)    NOT NULL DEFAULT 'FULL',
    inspection_qty   DECIMAL(18, 6) NOT NULL DEFAULT 0,
    qualified_qty    DECIMAL(18, 6) NOT NULL DEFAULT 0,
    rejected_qty     DECIMAL(18, 6) NOT NULL DEFAULT 0,
    inspection_result VARCHAR(32)   NOT NULL DEFAULT 'PENDING',
    inspector        VARCHAR(128),
    inspection_date  TIMESTAMP,
    inspection_status VARCHAR(32)   NOT NULL DEFAULT 'OPEN',
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
CREATE UNIQUE INDEX uk_erp_purchase_inspection_no ON erp_purchase_inspection (inspection_no);
CREATE INDEX idx_erp_purchase_inspection_receipt ON erp_purchase_inspection (receipt_no);
CREATE INDEX idx_erp_purchase_inspection_result ON erp_purchase_inspection (inspection_result);

-- ========== T093 ERP 采购入库单 ==========

CREATE TABLE erp_purchase_inbound (
    id             BIGINT         NOT NULL,
    inbound_no     VARCHAR(64)    NOT NULL,
    receipt_no     VARCHAR(64),
    order_no       VARCHAR(64),
    supplier_code  VARCHAR(64),
    warehouse_code VARCHAR(64),
    inbound_date   TIMESTAMP,
    inbound_qty    DECIMAL(18, 6) NOT NULL DEFAULT 0,
    batch_no       VARCHAR(64),
    operator_name  VARCHAR(128),
    inbound_status VARCHAR(32)    NOT NULL DEFAULT 'DRAFT',
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
CREATE UNIQUE INDEX uk_erp_purchase_inbound_no ON erp_purchase_inbound (inbound_no);
CREATE INDEX idx_erp_purchase_inbound_receipt ON erp_purchase_inbound (receipt_no);
CREATE INDEX idx_erp_purchase_inbound_status ON erp_purchase_inbound (inbound_status);

-- ========== T023/T093 ERP 采购发票 ==========

CREATE TABLE erp_purchase_invoice (
    id             BIGINT         NOT NULL,
    invoice_no     VARCHAR(64)    NOT NULL,
    invoice_type   VARCHAR(32)    NOT NULL DEFAULT 'SPECIAL',
    invoice_code   VARCHAR(64),
    order_no       VARCHAR(64),
    receipt_no     VARCHAR(64),
    supplier_code  VARCHAR(64)    NOT NULL,
    supplier_name  VARCHAR(200),
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
CREATE UNIQUE INDEX uk_erp_purchase_invoice_no ON erp_purchase_invoice (invoice_no);
CREATE INDEX idx_erp_purchase_invoice_supplier ON erp_purchase_invoice (supplier_code);
CREATE INDEX idx_erp_purchase_invoice_status ON erp_purchase_invoice (invoice_status);

-- ========== T023 ERP 采购退货单 ==========

CREATE TABLE erp_purchase_return (
    id             BIGINT         NOT NULL,
    return_no      VARCHAR(64)    NOT NULL,
    order_no       VARCHAR(64),
    receipt_no     VARCHAR(64),
    supplier_code  VARCHAR(64)    NOT NULL,
    supplier_name  VARCHAR(200),
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
CREATE UNIQUE INDEX uk_erp_purchase_return_no ON erp_purchase_return (return_no);
CREATE INDEX idx_erp_purchase_return_supplier ON erp_purchase_return (supplier_code);
CREATE INDEX idx_erp_purchase_return_status ON erp_purchase_return (return_status);

-- ========== T023/T093 ERP 采购结算单 ==========

CREATE TABLE erp_purchase_settlement (
    id                BIGINT         NOT NULL,
    settlement_no     VARCHAR(64)    NOT NULL,
    supplier_code     VARCHAR(64)    NOT NULL,
    supplier_name     VARCHAR(200),
    order_no          VARCHAR(64),
    invoice_no        VARCHAR(64),
    settlement_date   TIMESTAMP,
    settlement_amount DECIMAL(18, 4) NOT NULL DEFAULT 0,
    paid_amount       DECIMAL(18, 4) NOT NULL DEFAULT 0,
    settle_balance    DECIMAL(18, 4) NOT NULL DEFAULT 0,
    payment_term      VARCHAR(32)    NOT NULL DEFAULT 'NET30',
    settlement_status VARCHAR(32)    NOT NULL DEFAULT 'OPEN',
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
CREATE UNIQUE INDEX uk_erp_purchase_settlement_no ON erp_purchase_settlement (settlement_no);
CREATE INDEX idx_erp_purchase_settlement_supplier ON erp_purchase_settlement (supplier_code);
CREATE INDEX idx_erp_purchase_settlement_status ON erp_purchase_settlement (settlement_status);
