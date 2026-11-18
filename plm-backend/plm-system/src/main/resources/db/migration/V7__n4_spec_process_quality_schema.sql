-- N4 技术规格、工艺与质量：规格模板与字段、规格实例与取值、线束端子、环保合规、包装标签技术要求、
-- 工艺路线与工序、检验规范与检验项目、缺陷代码库、质量问题单与措施验证记录
-- 说明：SQL 同时兼容 PostgreSQL 与 H2（PostgreSQL 兼容模式），主键由应用侧雪花算法生成。

-- ========== 技术规格（DEV-042 / DEV-043） ==========

CREATE TABLE spec_template (
    id             BIGINT       NOT NULL,
    template_code  VARCHAR(64)  NOT NULL,
    template_name  VARCHAR(128) NOT NULL,
    product_series VARCHAR(64),
    product_code   VARCHAR(64),
    spec_category  VARCHAR(32)  NOT NULL DEFAULT 'electrical',
    version_no     VARCHAR(32)  NOT NULL DEFAULT 'V1',
    status         VARCHAR(32)  NOT NULL DEFAULT 'draft',
    description    VARCHAR(500),
    remark         VARCHAR(255),
    created_by     BIGINT,
    created_at     TIMESTAMP,
    updated_by     BIGINT,
    updated_at     TIMESTAMP,
    deleted        INT          NOT NULL DEFAULT 0,
    version        INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_spec_template_code ON spec_template (template_code, version_no);
CREATE INDEX idx_spec_template_series ON spec_template (product_series);
CREATE INDEX idx_spec_template_category ON spec_template (spec_category);

CREATE TABLE spec_template_field (
    id                BIGINT       NOT NULL,
    template_id       BIGINT       NOT NULL,
    field_code        VARCHAR(64)  NOT NULL,
    field_name        VARCHAR(128) NOT NULL,
    field_category    VARCHAR(32),
    data_type         VARCHAR(32)  NOT NULL DEFAULT 'number',
    unit              VARCHAR(32),
    min_value         DECIMAL(18, 4),
    max_value         DECIMAL(18, 4),
    target_value      VARCHAR(128),
    required_flag     INT          NOT NULL DEFAULT 0,
    default_value     VARCHAR(255),
    options_text      VARCHAR(500),
    inspection_method VARCHAR(255),
    sort_no           INT          NOT NULL DEFAULT 0,
    status            INT          NOT NULL DEFAULT 1,
    remark            VARCHAR(255),
    created_by        BIGINT,
    created_at        TIMESTAMP,
    updated_by        BIGINT,
    updated_at        TIMESTAMP,
    deleted           INT          NOT NULL DEFAULT 0,
    version           INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE INDEX idx_spec_template_field_template ON spec_template_field (template_id);

CREATE TABLE spec_instance (
    id             BIGINT       NOT NULL,
    instance_code  VARCHAR(64)  NOT NULL,
    template_id    BIGINT,
    template_code  VARCHAR(64),
    product_code   VARCHAR(64),
    product_name   VARCHAR(128),
    version_no     VARCHAR(32)  NOT NULL DEFAULT 'V1',
    status         VARCHAR(32)  NOT NULL DEFAULT 'draft',
    effective_date DATE,
    remark         VARCHAR(255),
    created_by     BIGINT,
    created_at     TIMESTAMP,
    updated_by     BIGINT,
    updated_at     TIMESTAMP,
    deleted        INT          NOT NULL DEFAULT 0,
    version        INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_spec_instance_code ON spec_instance (instance_code, version_no);
CREATE INDEX idx_spec_instance_product ON spec_instance (product_code);
CREATE INDEX idx_spec_instance_template ON spec_instance (template_id);

CREATE TABLE spec_instance_value (
    id                BIGINT       NOT NULL,
    instance_id       BIGINT       NOT NULL,
    field_code        VARCHAR(64)  NOT NULL,
    field_name        VARCHAR(128),
    field_category    VARCHAR(32),
    unit              VARCHAR(32),
    min_value         DECIMAL(18, 4),
    max_value         DECIMAL(18, 4),
    target_value      VARCHAR(128),
    value_text        VARCHAR(255),
    value_number      DECIMAL(18, 4),
    pass_flag         INT,
    inspection_method VARCHAR(255),
    sort_no           INT          NOT NULL DEFAULT 0,
    remark            VARCHAR(255),
    created_by        BIGINT,
    created_at        TIMESTAMP,
    updated_by        BIGINT,
    updated_at        TIMESTAMP,
    deleted           INT          NOT NULL DEFAULT 0,
    version           INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE INDEX idx_spec_instance_value_instance ON spec_instance_value (instance_id);

-- ========== 附件线束端子（DEV-044） ==========

CREATE TABLE spec_harness (
    id             BIGINT       NOT NULL,
    harness_code   VARCHAR(64)  NOT NULL,
    harness_name   VARCHAR(128) NOT NULL,
    product_code   VARCHAR(64),
    material_code  VARCHAR(64),
    bom_header_id  BIGINT,
    bom_code       VARCHAR(128),
    bom_position   VARCHAR(64),
    doc_no         VARCHAR(64),
    total_length   DECIMAL(18, 2),
    connector_qty  INT,
    status         VARCHAR(32)  NOT NULL DEFAULT 'draft',
    description    VARCHAR(500),
    remark         VARCHAR(255),
    created_by     BIGINT,
    created_at     TIMESTAMP,
    updated_by     BIGINT,
    updated_at     TIMESTAMP,
    deleted        INT          NOT NULL DEFAULT 0,
    version        INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_spec_harness_code ON spec_harness (harness_code);
CREATE INDEX idx_spec_harness_material ON spec_harness (material_code);

CREATE TABLE spec_harness_terminal (
    id                     BIGINT       NOT NULL,
    harness_id             BIGINT       NOT NULL,
    seq_no                 INT          NOT NULL DEFAULT 1,
    wire_material_code     VARCHAR(64),
    wire_spec              VARCHAR(64),
    wire_color             VARCHAR(32),
    wire_length            DECIMAL(18, 2),
    terminal_material_code VARCHAR(64),
    terminal_name          VARCHAR(128),
    sheath_material_code   VARCHAR(64),
    sheath_name            VARCHAR(128),
    from_connector         VARCHAR(64),
    from_pin               VARCHAR(32),
    to_connector           VARCHAR(64),
    to_pin                 VARCHAR(32),
    assemble_requirement   VARCHAR(500),
    remark                 VARCHAR(255),
    created_by             BIGINT,
    created_at             TIMESTAMP,
    updated_by             BIGINT,
    updated_at             TIMESTAMP,
    deleted                INT          NOT NULL DEFAULT 0,
    version                INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE INDEX idx_spec_harness_terminal_harness ON spec_harness_terminal (harness_id);

-- ========== 环保合规（DEV-045） ==========

CREATE TABLE spec_compliance (
    id                BIGINT       NOT NULL,
    compliance_code   VARCHAR(64)  NOT NULL,
    material_code     VARCHAR(64),
    material_name     VARCHAR(128),
    requirement_type  VARCHAR(32)  NOT NULL DEFAULT 'rohs',
    risk_level        VARCHAR(16)  NOT NULL DEFAULT 'low',
    supplier_code     VARCHAR(64),
    declaration_no    VARCHAR(128),
    declaration_file  VARCHAR(500),
    effective_date    DATE,
    expire_date       DATE,
    status            VARCHAR(32)  NOT NULL DEFAULT 'pending',
    checked_at        TIMESTAMP,
    remark            VARCHAR(255),
    created_by        BIGINT,
    created_at        TIMESTAMP,
    updated_by        BIGINT,
    updated_at        TIMESTAMP,
    deleted           INT          NOT NULL DEFAULT 0,
    version           INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_spec_compliance_code ON spec_compliance (compliance_code);
CREATE INDEX idx_spec_compliance_material ON spec_compliance (material_code);

-- ========== 包装与标签技术要求（DEV-046） ==========

CREATE TABLE spec_packaging (
    id                BIGINT       NOT NULL,
    packaging_code    VARCHAR(64)  NOT NULL,
    product_code      VARCHAR(64),
    product_name      VARCHAR(128),
    customer_code     VARCHAR(64),
    version_no        VARCHAR(32)  NOT NULL DEFAULT 'V1',
    pack_qty          INT,
    label_template_code VARCHAR(64),
    qr_rule_key       VARCHAR(128),
    packaging_material VARCHAR(255),
    dimension_text    VARCHAR(255),
    special_requirement VARCHAR(500),
    status            VARCHAR(32)  NOT NULL DEFAULT 'draft',
    effective_date    DATE,
    remark            VARCHAR(255),
    created_by        BIGINT,
    created_at        TIMESTAMP,
    updated_by        BIGINT,
    updated_at        TIMESTAMP,
    deleted           INT          NOT NULL DEFAULT 0,
    version           INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_spec_packaging_code ON spec_packaging (packaging_code, version_no);
CREATE INDEX idx_spec_packaging_product ON spec_packaging (product_code);

-- ========== 工艺路线（DEV-047） ==========

CREATE TABLE process_route (
    id              BIGINT       NOT NULL,
    route_code      VARCHAR(64)  NOT NULL,
    route_name      VARCHAR(128) NOT NULL,
    product_code    VARCHAR(64),
    product_name    VARCHAR(128),
    version_no      VARCHAR(32)  NOT NULL DEFAULT 'V1',
    process_version VARCHAR(32),
    status          VARCHAR(32)  NOT NULL DEFAULT 'draft',
    effective_date  DATE,
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
CREATE UNIQUE INDEX uk_process_route_code ON process_route (route_code, version_no);
CREATE INDEX idx_process_route_product ON process_route (product_code);

CREATE TABLE process_operation (
    id                        BIGINT       NOT NULL,
    route_id                  BIGINT       NOT NULL,
    seq_no                    INT          NOT NULL DEFAULT 1,
    operation_code            VARCHAR(64)  NOT NULL,
    operation_name            VARCHAR(128) NOT NULL,
    work_center               VARCHAR(64),
    process_params            VARCHAR(500),
    fixture_tooling           VARCHAR(255),
    work_instruction_doc_no   VARCHAR(64),
    standard_time             VARCHAR(32),
    inspection_required       INT          NOT NULL DEFAULT 1,
    inspection_spec_code      VARCHAR(64),
    key_operation             INT          NOT NULL DEFAULT 0,
    remark                    VARCHAR(255),
    created_by                BIGINT,
    created_at                TIMESTAMP,
    updated_by                BIGINT,
    updated_at                TIMESTAMP,
    deleted                   INT          NOT NULL DEFAULT 0,
    version                   INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE INDEX idx_process_operation_route ON process_operation (route_id);

-- ========== 检验规范（DEV-048） ==========

CREATE TABLE inspection_spec (
    id               BIGINT       NOT NULL,
    spec_code        VARCHAR(64)  NOT NULL,
    spec_name        VARCHAR(128) NOT NULL,
    inspection_type  VARCHAR(16)  NOT NULL DEFAULT 'iqc',
    product_code     VARCHAR(64),
    material_code    VARCHAR(64),
    version_no       VARCHAR(32)  NOT NULL DEFAULT 'V1',
    sampling_plan    VARCHAR(255),
    aql_level        VARCHAR(32),
    status           VARCHAR(32)  NOT NULL DEFAULT 'draft',
    effective_date   DATE,
    remark           VARCHAR(255),
    created_by       BIGINT,
    created_at       TIMESTAMP,
    updated_by       BIGINT,
    updated_at       TIMESTAMP,
    deleted          INT          NOT NULL DEFAULT 0,
    version          INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_inspection_spec_code ON inspection_spec (spec_code, version_no);
CREATE INDEX idx_inspection_spec_material ON inspection_spec (material_code);
CREATE INDEX idx_inspection_spec_product ON inspection_spec (product_code);
CREATE INDEX idx_inspection_spec_type ON inspection_spec (inspection_type);

CREATE TABLE inspection_item (
    id                BIGINT       NOT NULL,
    spec_id           BIGINT       NOT NULL,
    seq_no            INT          NOT NULL DEFAULT 1,
    item_code         VARCHAR(64),
    item_name         VARCHAR(128) NOT NULL,
    inspection_method VARCHAR(255),
    equipment         VARCHAR(128),
    unit              VARCHAR(32),
    standard_value    VARCHAR(128),
    upper_limit       DECIMAL(18, 4),
    lower_limit       DECIMAL(18, 4),
    verdict_rule      VARCHAR(255),
    key_item          INT          NOT NULL DEFAULT 0,
    remark            VARCHAR(255),
    created_by        BIGINT,
    created_at        TIMESTAMP,
    updated_by        BIGINT,
    updated_at        TIMESTAMP,
    deleted           INT          NOT NULL DEFAULT 0,
    version           INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE INDEX idx_inspection_item_spec ON inspection_item (spec_id);

-- ========== 质量：缺陷代码库与质量问题（DEV-049 / DEV-050） ==========

CREATE TABLE quality_defect_code (
    id                BIGINT       NOT NULL,
    defect_code       VARCHAR(64)  NOT NULL,
    defect_name       VARCHAR(128) NOT NULL,
    defect_category   VARCHAR(64),
    operation_code    VARCHAR(64),
    station           VARCHAR(64),
    responsible_dept  VARCHAR(128),
    default_cause     VARCHAR(500),
    default_action    VARCHAR(500),
    severity          VARCHAR(16)  NOT NULL DEFAULT 'minor',
    status            INT          NOT NULL DEFAULT 1,
    remark            VARCHAR(255),
    created_by        BIGINT,
    created_at        TIMESTAMP,
    updated_by        BIGINT,
    updated_at        TIMESTAMP,
    deleted           INT          NOT NULL DEFAULT 0,
    version           INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_quality_defect_code ON quality_defect_code (defect_code);

CREATE TABLE quality_issue (
    id                BIGINT        NOT NULL,
    issue_no          VARCHAR(64)   NOT NULL,
    title             VARCHAR(200)  NOT NULL,
    source_type       VARCHAR(32)   NOT NULL DEFAULT 'internal',
    product_code      VARCHAR(64),
    material_code     VARCHAR(64),
    batch_no          VARCHAR(64),
    work_order_no     VARCHAR(64),
    operation_code    VARCHAR(64),
    defect_code       VARCHAR(64),
    defect_name       VARCHAR(128),
    severity          VARCHAR(16)   NOT NULL DEFAULT 'minor',
    found_qty         DECIMAL(18, 4),
    issue_desc        VARCHAR(1000),
    responsible_dept  VARCHAR(128),
    responsible_id    BIGINT,
    responsible_name  VARCHAR(64),
    temp_action       VARCHAR(1000),
    root_cause        VARCHAR(1000),
    permanent_action  VARCHAR(1000),
    verify_result     VARCHAR(1000),
    status            VARCHAR(32)   NOT NULL DEFAULT 'open',
    found_at          TIMESTAMP,
    closed_at         TIMESTAMP,
    ecr_id            BIGINT,
    ecr_no            VARCHAR(64),
    remark            VARCHAR(255),
    created_by        BIGINT,
    created_at        TIMESTAMP,
    updated_by        BIGINT,
    updated_at        TIMESTAMP,
    deleted           INT           NOT NULL DEFAULT 0,
    version           INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_quality_issue_no ON quality_issue (issue_no);
CREATE INDEX idx_quality_issue_status ON quality_issue (status);
CREATE INDEX idx_quality_issue_material ON quality_issue (material_code);
CREATE INDEX idx_quality_issue_batch ON quality_issue (batch_no);

CREATE TABLE quality_issue_action (
    id           BIGINT        NOT NULL,
    issue_id     BIGINT        NOT NULL,
    action_type  VARCHAR(32)   NOT NULL,
    content      VARCHAR(1000) NOT NULL,
    owner_id     BIGINT,
    owner_name   VARCHAR(64),
    due_date     DATE,
    completed_at TIMESTAMP,
    result       VARCHAR(500),
    evidence     VARCHAR(500),
    status       VARCHAR(32)   NOT NULL DEFAULT 'open',
    remark       VARCHAR(255),
    created_by   BIGINT,
    created_at   TIMESTAMP,
    updated_by   BIGINT,
    updated_at   TIMESTAMP,
    deleted      INT           NOT NULL DEFAULT 0,
    version      INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE INDEX idx_quality_issue_action_issue ON quality_issue_action (issue_id);
