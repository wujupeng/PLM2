-- N2 产品、物料与多级 BOM 主数据：产品型号、物料分类、物料主档、供应商、替代关系、变更留痕、数据质量、BOM 头/行、导入批次与错误、BOM 异常、发布日志
-- 说明：SQL 同时兼容 PostgreSQL 与 H2（PostgreSQL 兼容模式），主键由应用侧雪花算法生成。

-- ========== 产品物料主数据 ==========

CREATE TABLE md_product (
    id            BIGINT       NOT NULL,
    product_code  VARCHAR(64)  NOT NULL,
    product_name  VARCHAR(128) NOT NULL,
    series_code   VARCHAR(64),
    series_name   VARCHAR(128),
    customer_code VARCHAR(64),
    model         VARCHAR(128),
    status        VARCHAR(32)  NOT NULL DEFAULT 'draft',
    description   VARCHAR(500),
    remark        VARCHAR(255),
    created_by    BIGINT,
    created_at    TIMESTAMP,
    updated_by    BIGINT,
    updated_at    TIMESTAMP,
    deleted       INT          NOT NULL DEFAULT 0,
    version       INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_md_product_code ON md_product (product_code);
CREATE INDEX idx_md_product_series ON md_product (series_code);
CREATE INDEX idx_md_product_customer ON md_product (customer_code);

CREATE TABLE md_material_category (
    id              BIGINT       NOT NULL,
    category_code   VARCHAR(64)  NOT NULL,
    category_name   VARCHAR(128) NOT NULL,
    parent_id       BIGINT       NOT NULL DEFAULT 0,
    code_rule_key   VARCHAR(128),
    required_fields VARCHAR(1000),
    sort_no         INT          NOT NULL DEFAULT 0,
    status          INT          NOT NULL DEFAULT 1,
    remark          VARCHAR(255),
    created_by      BIGINT,
    created_at      TIMESTAMP,
    updated_by      BIGINT,
    updated_at      TIMESTAMP,
    deleted         INT          NOT NULL DEFAULT 0,
    version         INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_md_material_category_code ON md_material_category (category_code);
CREATE INDEX idx_md_material_category_parent ON md_material_category (parent_id);

CREATE TABLE md_supplier (
    id            BIGINT       NOT NULL,
    supplier_code VARCHAR(64)  NOT NULL,
    supplier_name VARCHAR(128) NOT NULL,
    contact       VARCHAR(64),
    phone         VARCHAR(32),
    email         VARCHAR(128),
    status        INT          NOT NULL DEFAULT 1,
    remark        VARCHAR(255),
    created_by    BIGINT,
    created_at    TIMESTAMP,
    updated_by    BIGINT,
    updated_at    TIMESTAMP,
    deleted       INT          NOT NULL DEFAULT 0,
    version       INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_md_supplier_code ON md_supplier (supplier_code);

CREATE TABLE md_material (
    id               BIGINT       NOT NULL,
    material_code    VARCHAR(64)  NOT NULL,
    material_name    VARCHAR(128) NOT NULL,
    category_id      BIGINT,
    category_code    VARCHAR(64),
    spec             VARCHAR(255),
    material_type    VARCHAR(32)  NOT NULL DEFAULT 'part',
    unit             VARCHAR(32)  NOT NULL DEFAULT 'PCS',
    source_type      VARCHAR(16)  NOT NULL DEFAULT 'make',
    supplier_id      BIGINT,
    supplier_code    VARCHAR(64),
    lifecycle_status VARCHAR(32)  NOT NULL DEFAULT 'draft',
    version_no       VARCHAR(32)  NOT NULL DEFAULT 'V1',
    effective_date   DATE,
    obsolete_date    DATE,
    std_cost         DECIMAL(18, 4),
    remark           VARCHAR(255),
    created_by       BIGINT,
    created_at       TIMESTAMP,
    updated_by       BIGINT,
    updated_at       TIMESTAMP,
    deleted          INT          NOT NULL DEFAULT 0,
    version          INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_md_material_code ON md_material (material_code);
CREATE INDEX idx_md_material_category ON md_material (category_id);
CREATE INDEX idx_md_material_supplier ON md_material (supplier_id);

CREATE TABLE md_material_substitute (
    id                       BIGINT       NOT NULL,
    material_id              BIGINT       NOT NULL,
    material_code            VARCHAR(64)  NOT NULL,
    substitute_material_id   BIGINT       NOT NULL,
    substitute_material_code VARCHAR(64)  NOT NULL,
    priority                 INT          NOT NULL DEFAULT 1,
    applicable_condition     VARCHAR(255),
    valid_from               DATE,
    valid_to                 DATE,
    status                   INT          NOT NULL DEFAULT 1,
    remark                   VARCHAR(255),
    created_by               BIGINT,
    created_at               TIMESTAMP,
    updated_by               BIGINT,
    updated_at               TIMESTAMP,
    deleted                  INT          NOT NULL DEFAULT 0,
    version                  INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_md_material_substitute ON md_material_substitute (material_id, substitute_material_id);
CREATE INDEX idx_md_material_substitute_code ON md_material_substitute (material_code);

-- 物料/产品字段变更留痕（DEV-019 / DEV-023 已发布版本不可无痕修改）
CREATE TABLE md_change_log (
    id            BIGINT       NOT NULL,
    entity_type   VARCHAR(32)  NOT NULL,
    entity_id     BIGINT,
    entity_code   VARCHAR(64),
    change_type   VARCHAR(32)  NOT NULL,
    field_name    VARCHAR(64),
    old_value     VARCHAR(1000),
    new_value     VARCHAR(1000),
    operator_id   BIGINT,
    operator_name VARCHAR(64),
    remark        VARCHAR(500),
    created_by    BIGINT,
    created_at    TIMESTAMP,
    updated_by    BIGINT,
    updated_at    TIMESTAMP,
    deleted       INT          NOT NULL DEFAULT 0,
    version       INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE INDEX idx_md_change_log_entity ON md_change_log (entity_type, entity_id);

-- 物料数据质量问题清单（DEV-024 缺失/冲突/重复清单及修复状态）
CREATE TABLE md_data_quality_issue (
    id          BIGINT       NOT NULL,
    rule_code   VARCHAR(64)  NOT NULL,
    rule_name   VARCHAR(128) NOT NULL,
    entity_type VARCHAR(32)  NOT NULL,
    entity_id   BIGINT,
    entity_code VARCHAR(64),
    severity    VARCHAR(16)  NOT NULL DEFAULT 'warning',
    message     VARCHAR(500),
    status      VARCHAR(16)  NOT NULL DEFAULT 'open',
    remark      VARCHAR(255),
    created_by  BIGINT,
    created_at  TIMESTAMP,
    updated_by  BIGINT,
    updated_at  TIMESTAMP,
    deleted     INT          NOT NULL DEFAULT 0,
    version     INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE INDEX idx_md_data_quality_status ON md_data_quality_issue (status);
CREATE INDEX idx_md_data_quality_entity ON md_data_quality_issue (entity_type, entity_id);

-- ========== BOM 主数据 ==========

CREATE TABLE bom_header (
    id              BIGINT       NOT NULL,
    bom_code        VARCHAR(64)  NOT NULL,
    product_id      BIGINT,
    product_code    VARCHAR(64)  NOT NULL,
    bom_type        VARCHAR(16)  NOT NULL DEFAULT 'EBOM',
    version_no      VARCHAR(32)  NOT NULL DEFAULT 'V1',
    status          VARCHAR(32)  NOT NULL DEFAULT 'draft',
    effective_from  DATE,
    effective_to    DATE,
    source_batch_id BIGINT,
    source_bom_id   BIGINT,
    description     VARCHAR(500),
    remark          VARCHAR(255),
    created_by      BIGINT,
    created_at      TIMESTAMP,
    updated_by      BIGINT,
    updated_at      TIMESTAMP,
    deleted         INT          NOT NULL DEFAULT 0,
    version         INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_bom_header ON bom_header (product_code, bom_type, version_no);
CREATE INDEX idx_bom_header_product ON bom_header (product_id);

CREATE TABLE bom_line (
    id                  BIGINT        NOT NULL,
    header_id           BIGINT        NOT NULL,
    line_no             INT           NOT NULL,
    parent_material_code VARCHAR(64)  NOT NULL,
    child_material_code  VARCHAR(64)  NOT NULL,
    child_material_name  VARCHAR(128),
    qty                 DECIMAL(18, 6) NOT NULL DEFAULT 1,
    unit                VARCHAR(32)   NOT NULL DEFAULT 'PCS',
    item_seq            VARCHAR(64),
    substitute_allowed  INT           NOT NULL DEFAULT 0,
    valid_from          DATE,
    valid_to            DATE,
    remark              VARCHAR(255),
    created_by          BIGINT,
    created_at          TIMESTAMP,
    updated_by          BIGINT,
    updated_at          TIMESTAMP,
    deleted             INT           NOT NULL DEFAULT 0,
    version             INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE INDEX idx_bom_line_header ON bom_line (header_id);
CREATE INDEX idx_bom_line_child ON bom_line (child_material_code);

-- BOM 单阶导入批次（DEV-025 源文件行数、成功/失败数可核对；原始来源可追溯）
CREATE TABLE bom_import_batch (
    id           BIGINT       NOT NULL,
    batch_no     VARCHAR(64)  NOT NULL,
    bom_type     VARCHAR(16)  NOT NULL DEFAULT 'EBOM',
    source_file  VARCHAR(255),
    product_code VARCHAR(64),
    total_rows   INT          NOT NULL DEFAULT 0,
    success_rows INT          NOT NULL DEFAULT 0,
    fail_rows    INT          NOT NULL DEFAULT 0,
    status       VARCHAR(32)  NOT NULL DEFAULT 'pending',
    header_id    BIGINT,
    remark       VARCHAR(255),
    created_by   BIGINT,
    created_at   TIMESTAMP,
    updated_by   BIGINT,
    updated_at   TIMESTAMP,
    deleted      INT          NOT NULL DEFAULT 0,
    version      INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_bom_import_batch_no ON bom_import_batch (batch_no);

CREATE TABLE bom_import_error (
    id            BIGINT       NOT NULL,
    batch_id      BIGINT       NOT NULL,
    sheet_name    VARCHAR(128),
    row_number    INT,
    field_name    VARCHAR(64),
    error_message VARCHAR(500),
    raw_row       VARCHAR(1000),
    created_by    BIGINT,
    created_at    TIMESTAMP,
    updated_by    BIGINT,
    updated_at    TIMESTAMP,
    deleted       INT          NOT NULL DEFAULT 0,
    version       INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE INDEX idx_bom_import_error_batch ON bom_import_error (batch_id);

-- BOM 异常校验结果（DEV-029 重复、孤儿、循环、缺量）
CREATE TABLE bom_issue (
    id            BIGINT       NOT NULL,
    header_id     BIGINT       NOT NULL,
    issue_type    VARCHAR(32)  NOT NULL,
    severity      VARCHAR(16)  NOT NULL DEFAULT 'error',
    line_no       INT,
    material_code VARCHAR(64),
    message       VARCHAR(500),
    status        VARCHAR(16)  NOT NULL DEFAULT 'open',
    created_by    BIGINT,
    created_at    TIMESTAMP,
    updated_by    BIGINT,
    updated_at    TIMESTAMP,
    deleted       INT          NOT NULL DEFAULT 0,
    version       INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE INDEX idx_bom_issue_header ON bom_issue (header_id);

-- BOM 发布与下游同步记录（DEV-032 / IF-02 失败可重试，下游版本与 PLM 发布记录一致）
CREATE TABLE bom_publish_log (
    id               BIGINT       NOT NULL,
    header_id        BIGINT       NOT NULL,
    bom_code         VARCHAR(64),
    version_no       VARCHAR(32),
    target_system    VARCHAR(16)  NOT NULL,
    status           VARCHAR(16)  NOT NULL DEFAULT 'pending',
    retry_count      INT          NOT NULL DEFAULT 0,
    request_payload  VARCHAR(2000),
    response_message VARCHAR(500),
    published_at     TIMESTAMP,
    created_by       BIGINT,
    created_at       TIMESTAMP,
    updated_by       BIGINT,
    updated_at       TIMESTAMP,
    deleted          INT          NOT NULL DEFAULT 0,
    version          INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE INDEX idx_bom_publish_log_header ON bom_publish_log (header_id);
