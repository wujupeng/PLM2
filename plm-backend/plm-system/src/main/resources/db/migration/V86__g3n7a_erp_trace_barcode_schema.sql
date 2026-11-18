-- G3-N7a ERP—业务单据追踪与条码（对应总任务书 WBS T029 业务单据追踪、T030 条码业务、T099 条码生成，属 G3 ERP）。
-- 说明：SQL 同时兼容 PostgreSQL 与 H2（PostgreSQL 兼容模式），主键由应用侧雪花算法生成。
-- 设计原则：
--   1) 业务范围：
--      T029 业务单据追踪：上下游单据关联（erp_doc_track）、审批状态、业务事件与操作日志（erp_doc_track_event）、报表（由查询统计实现）。
--      T030 条码业务 / T099 条码生成：标签模板（erp_barcode_template）、条码生成（erp_barcode，含采购订单条码/生产订单条码/物料标签）、
--        补打记录（erp_barcode_reprint）、条码与扫码规则（erp_barcode_rule，含收发料扫码规则与扫描校验规则）、
--        扫描校验记录（erp_barcode_scan）。T030 与 T099 业务语义重叠，本节点统一建表、一次实现。
--   2) 主数据权责约束（见《主数据权责》表）：
--      物料权威源为 PLM，采购订单权威源为 ERP 采购模块，生产订单权威源为 ERP 生产模块；
--      追溯与条码以「单号/编码」引用上游单据与物料，不重复建表。
--   3) 平台公共能力复用（不重复建表）：组织（sys_organization）、法人（sys_legal_entity）、工厂（sys_factory）、
--      单据状态机（sys_doc_state_*）、审批（oa_process_*）由 G1 平台底座提供，本模块按编码引用；
--      追溯状态、事件类型、条码类型、打印状态、扫描结果等业务语义字段在本模块内维护。
--   4) 单据编号规则：*_no 支持人工指定，未指定时由服务层按统一前缀自动生成；
--      条码链：标签模板（erp_barcode_template）→ 条码生成（erp_barcode）→ 补打（erp_barcode_reprint）
--      → 扫码规则（erp_barcode_rule）→ 扫描校验（erp_barcode_scan）。
-- 注意：
--   a) 业务字段一律不得命名为 version，避免与 BaseEntity 的乐观锁字段 version 冲突。
--   b) 具备业务编码唯一索引的单据表删除语义为「释放编码」，由服务层执行物理删除；
--      事件行/明细行无业务编码唯一索引，随头删除时逻辑删除即可。
--   c) 多法人多工厂：各单据以 org_id/org_name 归属组织（法人/工厂）。

-- ========== T029 ERP 单据追溯（上下游单据关联/审批状态） ==========

CREATE TABLE erp_doc_track (
    id                   BIGINT         NOT NULL,
    trace_no             VARCHAR(64)    NOT NULL,
    doc_type             VARCHAR(32)    NOT NULL DEFAULT 'SALES_ORDER',
    doc_no               VARCHAR(64)    NOT NULL,
    doc_title            VARCHAR(200),
    source_doc_type      VARCHAR(32),
    source_doc_no        VARCHAR(64),
    target_doc_type      VARCHAR(32),
    target_doc_no        VARCHAR(64),
    track_level          INT            NOT NULL DEFAULT 1,
    biz_status           VARCHAR(32)    NOT NULL DEFAULT 'OPEN',
    approval_status      VARCHAR(32)    NOT NULL DEFAULT 'NONE',
    approval_instance_no VARCHAR(64),
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
CREATE UNIQUE INDEX uk_erp_doc_track_no ON erp_doc_track (trace_no);
CREATE INDEX idx_erp_doc_track_doc_no ON erp_doc_track (doc_no);
CREATE INDEX idx_erp_doc_track_source ON erp_doc_track (source_doc_no);

-- ========== T029 ERP 单据业务事件/操作日志（追溯明细） ==========

CREATE TABLE erp_doc_track_event (
    id            BIGINT         NOT NULL,
    trace_no      VARCHAR(64),
    line_no       INT,
    event_type    VARCHAR(32)    NOT NULL DEFAULT 'STATUS_CHANGE',
    event_name    VARCHAR(200),
    event_time    TIMESTAMP,
    operator_name VARCHAR(128),
    event_status  VARCHAR(32)    NOT NULL DEFAULT 'DONE',
    event_detail  VARCHAR(1000),
    org_id        BIGINT,
    org_name      VARCHAR(128),
    description   VARCHAR(1000),
    remark        VARCHAR(500),
    created_by    BIGINT,
    created_at    TIMESTAMP,
    updated_by    BIGINT,
    updated_at    TIMESTAMP,
    deleted       INT            NOT NULL DEFAULT 0,
    version       INT            NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE INDEX idx_erp_doc_track_event_trace ON erp_doc_track_event (trace_no);

-- ========== T030/T099 ERP 标签模板 ==========

CREATE TABLE erp_barcode_template (
    id                BIGINT         NOT NULL,
    template_code     VARCHAR(64)    NOT NULL,
    template_name     VARCHAR(200),
    template_type     VARCHAR(32)    NOT NULL DEFAULT 'MATERIAL',
    label_width       DECIMAL(10, 2) NOT NULL DEFAULT 40,
    label_height      DECIMAL(10, 2) NOT NULL DEFAULT 30,
    content_config    VARCHAR(2000),
    print_permission  VARCHAR(64),
    template_status   VARCHAR(32)    NOT NULL DEFAULT 'ACTIVE',
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
CREATE UNIQUE INDEX uk_erp_barcode_template_code ON erp_barcode_template (template_code);
CREATE INDEX idx_erp_barcode_template_type ON erp_barcode_template (template_type);

-- ========== T030/T099 ERP 条码生成记录（采购订单条码/生产订单条码/物料标签） ==========

CREATE TABLE erp_barcode (
    id            BIGINT         NOT NULL,
    barcode_no    VARCHAR(64)    NOT NULL,
    barcode_type  VARCHAR(32)    NOT NULL DEFAULT 'MATERIAL',
    biz_no        VARCHAR(64),
    material_code VARCHAR(64),
    material_name VARCHAR(200),
    batch_no      VARCHAR(64),
    qty           DECIMAL(18, 2) NOT NULL DEFAULT 0,
    unit          VARCHAR(32),
    rule_code     VARCHAR(64),
    template_code VARCHAR(64),
    print_status  VARCHAR(32)    NOT NULL DEFAULT 'UNPRINTED',
    print_count   INT            NOT NULL DEFAULT 0,
    print_time    TIMESTAMP,
    printer       VARCHAR(64),
    org_id        BIGINT,
    org_name      VARCHAR(128),
    description   VARCHAR(1000),
    remark        VARCHAR(500),
    created_by    BIGINT,
    created_at    TIMESTAMP,
    updated_by    BIGINT,
    updated_at    TIMESTAMP,
    deleted       INT            NOT NULL DEFAULT 0,
    version       INT            NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_erp_barcode_no ON erp_barcode (barcode_no);
CREATE INDEX idx_erp_barcode_biz ON erp_barcode (biz_no);
CREATE INDEX idx_erp_barcode_material ON erp_barcode (material_code);

-- ========== T030/T099 ERP 条码补打记录 ==========

CREATE TABLE erp_barcode_reprint (
    id              BIGINT         NOT NULL,
    reprint_no      VARCHAR(64)    NOT NULL,
    barcode_no      VARCHAR(64),
    reprint_reason  VARCHAR(500),
    reprint_count   INT            NOT NULL DEFAULT 1,
    reprint_time    TIMESTAMP,
    operator_name   VARCHAR(128),
    approval_status VARCHAR(32)    NOT NULL DEFAULT 'NONE',
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
CREATE UNIQUE INDEX uk_erp_barcode_reprint_no ON erp_barcode_reprint (reprint_no);
CREATE INDEX idx_erp_barcode_reprint_barcode ON erp_barcode_reprint (barcode_no);

-- ========== T030/T099 ERP 条码与扫码规则（收发料扫码规则/扫描校验规则） ==========

CREATE TABLE erp_barcode_rule (
    id               BIGINT         NOT NULL,
    rule_code        VARCHAR(64)    NOT NULL,
    rule_name        VARCHAR(200),
    barcode_type     VARCHAR(32)    NOT NULL DEFAULT 'MATERIAL',
    rule_pattern     VARCHAR(200),
    scan_biz_type    VARCHAR(32)    NOT NULL DEFAULT 'RECEIPT',
    validate_enabled INT            NOT NULL DEFAULT 1,
    duplicate_check  INT            NOT NULL DEFAULT 1,
    rule_status      VARCHAR(32)    NOT NULL DEFAULT 'ACTIVE',
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
CREATE UNIQUE INDEX uk_erp_barcode_rule_code ON erp_barcode_rule (rule_code);
CREATE INDEX idx_erp_barcode_rule_biz ON erp_barcode_rule (scan_biz_type);

-- ========== T030/T099 ERP 扫描校验记录 ==========

CREATE TABLE erp_barcode_scan (
    id            BIGINT         NOT NULL,
    scan_no       VARCHAR(64)    NOT NULL,
    barcode_no    VARCHAR(64),
    scan_type     VARCHAR(32)    NOT NULL DEFAULT 'RECEIPT',
    biz_no        VARCHAR(64),
    material_code VARCHAR(64),
    scan_qty      DECIMAL(18, 2) NOT NULL DEFAULT 0,
    scan_time     TIMESTAMP,
    scanner       VARCHAR(128),
    scan_result   VARCHAR(32)    NOT NULL DEFAULT 'PASS',
    fail_reason   VARCHAR(500),
    org_id        BIGINT,
    org_name      VARCHAR(128),
    description   VARCHAR(1000),
    remark        VARCHAR(500),
    created_by    BIGINT,
    created_at    TIMESTAMP,
    updated_by    BIGINT,
    updated_at    TIMESTAMP,
    deleted       INT            NOT NULL DEFAULT 0,
    version       INT            NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_erp_barcode_scan_no ON erp_barcode_scan (scan_no);
CREATE INDEX idx_erp_barcode_scan_barcode ON erp_barcode_scan (barcode_no);
