-- N3 图文档、CAD 关联与工程变更：文档分类、图文档主档、文档版本、关联关系、签审任务、流转留痕、受控分发、
-- CAD 文件、CAD 属性映射、CAD 提取异常、ECR、ECO/ECN、变更明细、变更通知、影响分析
-- 说明：SQL 同时兼容 PostgreSQL 与 H2（PostgreSQL 兼容模式），主键由应用侧雪花算法生成。

-- ========== 图文档 ==========

CREATE TABLE doc_category (
    id                BIGINT       NOT NULL,
    category_code     VARCHAR(64)  NOT NULL,
    category_name     VARCHAR(128) NOT NULL,
    parent_id         BIGINT       NOT NULL DEFAULT 0,
    doc_type          VARCHAR(32),
    file_types        VARCHAR(255),
    required_metadata VARCHAR(1000),
    review_required   INT          NOT NULL DEFAULT 1,
    review_nodes      VARCHAR(255),
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
CREATE UNIQUE INDEX uk_doc_category_code ON doc_category (category_code);
CREATE INDEX idx_doc_category_parent ON doc_category (parent_id);

CREATE TABLE doc_document (
    id                        BIGINT       NOT NULL,
    doc_no                    VARCHAR(64)  NOT NULL,
    doc_name                  VARCHAR(200) NOT NULL,
    category_id               BIGINT,
    category_code             VARCHAR(64),
    doc_type                  VARCHAR(32),
    product_code              VARCHAR(64),
    material_code             VARCHAR(64),
    bom_header_id             BIGINT,
    bom_code                  VARCHAR(128),
    file_name                 VARCHAR(255),
    current_version_no        VARCHAR(32)  NOT NULL DEFAULT 'V1',
    status                    VARCHAR(32)  NOT NULL DEFAULT 'draft',
    distribution_controlled   INT          NOT NULL DEFAULT 0,
    owner_id                  BIGINT,
    owner_name                VARCHAR(64),
    description               VARCHAR(500),
    remark                    VARCHAR(255),
    created_by                BIGINT,
    created_at                TIMESTAMP,
    updated_by                BIGINT,
    updated_at                TIMESTAMP,
    deleted                   INT          NOT NULL DEFAULT 0,
    version                   INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_doc_document_no ON doc_document (doc_no);
CREATE INDEX idx_doc_document_material ON doc_document (material_code);
CREATE INDEX idx_doc_document_product ON doc_document (product_code);
CREATE INDEX idx_doc_document_category ON doc_document (category_code);
CREATE INDEX idx_doc_document_status ON doc_document (status);

CREATE TABLE doc_version (
    id            BIGINT       NOT NULL,
    document_id   BIGINT       NOT NULL,
    doc_no        VARCHAR(64)  NOT NULL,
    version_no    VARCHAR(32)  NOT NULL,
    file_name     VARCHAR(255),
    file_path     VARCHAR(500),
    file_size     BIGINT,
    file_type     VARCHAR(32),
    file_hash     VARCHAR(128),
    metadata_json VARCHAR(4000),
    change_note   VARCHAR(500),
    status        VARCHAR(32)  NOT NULL DEFAULT 'draft',
    released_at   TIMESTAMP,
    released_by   BIGINT,
    created_by    BIGINT,
    created_at    TIMESTAMP,
    updated_by    BIGINT,
    updated_at    TIMESTAMP,
    deleted       INT          NOT NULL DEFAULT 0,
    version       INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_doc_version ON doc_version (document_id, version_no);
CREATE INDEX idx_doc_version_document ON doc_version (document_id);

CREATE TABLE doc_relation (
    id            BIGINT       NOT NULL,
    document_id   BIGINT       NOT NULL,
    doc_no        VARCHAR(64),
    relation_type VARCHAR(32)  NOT NULL,
    target_id     BIGINT,
    target_code   VARCHAR(64),
    target_name   VARCHAR(200),
    relation_role VARCHAR(32)  NOT NULL DEFAULT 'reference',
    remark        VARCHAR(255),
    created_by    BIGINT,
    created_at    TIMESTAMP,
    updated_by    BIGINT,
    updated_at    TIMESTAMP,
    deleted       INT          NOT NULL DEFAULT 0,
    version       INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE INDEX idx_doc_relation_document ON doc_relation (document_id);
CREATE INDEX idx_doc_relation_target ON doc_relation (relation_type, target_code);

CREATE TABLE doc_review_task (
    id            BIGINT       NOT NULL,
    document_id   BIGINT       NOT NULL,
    doc_no        VARCHAR(64),
    version_no    VARCHAR(32)  NOT NULL,
    node_code     VARCHAR(32)  NOT NULL,
    node_name     VARCHAR(64),
    seq_no        INT          NOT NULL DEFAULT 1,
    assignee_id   BIGINT,
    assignee_name VARCHAR(64),
    decision      VARCHAR(32)  NOT NULL DEFAULT 'pending',
    comment       VARCHAR(500),
    decided_at    TIMESTAMP,
    created_by    BIGINT,
    created_at    TIMESTAMP,
    updated_by    BIGINT,
    updated_at    TIMESTAMP,
    deleted       INT          NOT NULL DEFAULT 0,
    version       INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE INDEX idx_doc_review_document ON doc_review_task (document_id, version_no);

CREATE TABLE doc_approval_log (
    id            BIGINT       NOT NULL,
    document_id   BIGINT       NOT NULL,
    doc_no        VARCHAR(64),
    version_no    VARCHAR(32),
    action        VARCHAR(32)  NOT NULL,
    operator_id   BIGINT,
    operator_name VARCHAR(64),
    comment       VARCHAR(500),
    created_by    BIGINT,
    created_at    TIMESTAMP,
    updated_by    BIGINT,
    updated_at    TIMESTAMP,
    deleted       INT          NOT NULL DEFAULT 0,
    version       INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE INDEX idx_doc_approval_document ON doc_approval_log (document_id);

CREATE TABLE doc_distribution (
    id             BIGINT       NOT NULL,
    document_id    BIGINT       NOT NULL,
    doc_no         VARCHAR(64),
    version_no     VARCHAR(32)  NOT NULL,
    recipient_type VARCHAR(32)  NOT NULL,
    recipient_code VARCHAR(64),
    recipient_name VARCHAR(128),
    distributed_at TIMESTAMP,
    status         VARCHAR(32)  NOT NULL DEFAULT 'active',
    remark         VARCHAR(255),
    created_by     BIGINT,
    created_at     TIMESTAMP,
    updated_by     BIGINT,
    updated_at     TIMESTAMP,
    deleted        INT          NOT NULL DEFAULT 0,
    version        INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE INDEX idx_doc_distribution_document ON doc_distribution (document_id);

-- ========== CAD 集成 ==========

CREATE TABLE cad_file (
    id              BIGINT       NOT NULL,
    cad_no          VARCHAR(64)  NOT NULL,
    file_name       VARCHAR(255) NOT NULL,
    file_path       VARCHAR(500),
    file_format     VARCHAR(32),
    cad_software    VARCHAR(64),
    software_version VARCHAR(64),
    compat_range    VARCHAR(128),
    file_size       BIGINT,
    file_hash       VARCHAR(128),
    document_id     BIGINT,
    doc_no          VARCHAR(64),
    product_code    VARCHAR(64),
    material_code   VARCHAR(64),
    extract_status  VARCHAR(32)  NOT NULL DEFAULT 'pending',
    extract_message VARCHAR(500),
    extracted_json  VARCHAR(4000),
    remark          VARCHAR(255),
    created_by      BIGINT,
    created_at      TIMESTAMP,
    updated_by      BIGINT,
    updated_at      TIMESTAMP,
    deleted         INT          NOT NULL DEFAULT 0,
    version         INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_cad_file_no ON cad_file (cad_no);
CREATE INDEX idx_cad_file_material ON cad_file (material_code);
CREATE INDEX idx_cad_file_document ON cad_file (document_id);

CREATE TABLE cad_attr_mapping (
    id              BIGINT       NOT NULL,
    cad_attr_name   VARCHAR(128) NOT NULL,
    cad_attr_label  VARCHAR(128),
    plm_field_name  VARCHAR(128) NOT NULL,
    plm_field_label VARCHAR(128),
    target_entity   VARCHAR(32)  NOT NULL DEFAULT 'document',
    required_flag   INT          NOT NULL DEFAULT 0,
    transform_rule  VARCHAR(255),
    default_value   VARCHAR(255),
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
CREATE UNIQUE INDEX uk_cad_attr_mapping ON cad_attr_mapping (cad_attr_name, target_entity);

CREATE TABLE cad_extract_error (
    id            BIGINT       NOT NULL,
    cad_file_id   BIGINT       NOT NULL,
    attr_name     VARCHAR(128),
    error_type    VARCHAR(32),
    error_message VARCHAR(500),
    raw_value     VARCHAR(500),
    created_by    BIGINT,
    created_at    TIMESTAMP,
    updated_by    BIGINT,
    updated_at    TIMESTAMP,
    deleted       INT          NOT NULL DEFAULT 0,
    version       INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE INDEX idx_cad_extract_error_file ON cad_extract_error (cad_file_id);

-- ========== 工程变更 ECR / ECO / ECN ==========

CREATE TABLE eco_change_request (
    id                  BIGINT        NOT NULL,
    ecr_no              VARCHAR(64)   NOT NULL,
    title               VARCHAR(200)  NOT NULL,
    source_type         VARCHAR(32)   NOT NULL DEFAULT 'internal',
    source_ref          VARCHAR(128),
    reason              VARCHAR(1000),
    risk_level          VARCHAR(16)   NOT NULL DEFAULT 'low',
    urgency             VARCHAR(16)   NOT NULL DEFAULT 'normal',
    affected_products   VARCHAR(1000),
    affected_materials  VARCHAR(1000),
    affected_documents  VARCHAR(1000),
    affected_processes  VARCHAR(1000),
    applicant_id        BIGINT,
    applicant_name      VARCHAR(64),
    status              VARCHAR(32)   NOT NULL DEFAULT 'draft',
    reviewer_id         BIGINT,
    reviewer_name       VARCHAR(64),
    review_comment      VARCHAR(500),
    reviewed_at         TIMESTAMP,
    remark              VARCHAR(255),
    created_by          BIGINT,
    created_at          TIMESTAMP,
    updated_by          BIGINT,
    updated_at          TIMESTAMP,
    deleted             INT           NOT NULL DEFAULT 0,
    version             INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_eco_change_request_no ON eco_change_request (ecr_no);
CREATE INDEX idx_ecr_status ON eco_change_request (status);

CREATE TABLE eco_change_order (
    id                BIGINT       NOT NULL,
    eco_no            VARCHAR(64)  NOT NULL,
    ecr_id            BIGINT,
    ecr_no            VARCHAR(64),
    title             VARCHAR(200) NOT NULL,
    change_type       VARCHAR(32)  NOT NULL DEFAULT 'modify',
    plan_desc         VARCHAR(1000),
    approval_status   VARCHAR(32)  NOT NULL DEFAULT 'draft',
    approver_id       BIGINT,
    approver_name     VARCHAR(64),
    approval_comment  VARCHAR(500),
    approved_at       TIMESTAMP,
    effective_date    DATE,
    effective_batch   VARCHAR(64),
    execution_status  VARCHAR(32)  NOT NULL DEFAULT 'pending',
    executed_at       TIMESTAMP,
    remark            VARCHAR(255),
    created_by        BIGINT,
    created_at        TIMESTAMP,
    updated_by        BIGINT,
    updated_at        TIMESTAMP,
    deleted           INT          NOT NULL DEFAULT 0,
    version           INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_eco_change_order_no ON eco_change_order (eco_no);
CREATE INDEX idx_eco_order_ecr ON eco_change_order (ecr_id);
CREATE INDEX idx_eco_order_status ON eco_change_order (approval_status);

CREATE TABLE eco_change_item (
    id            BIGINT       NOT NULL,
    eco_id        BIGINT       NOT NULL,
    object_type   VARCHAR(32)  NOT NULL,
    object_code   VARCHAR(64)  NOT NULL,
    object_name   VARCHAR(200),
    change_action VARCHAR(32)  NOT NULL DEFAULT 'modify',
    before_version VARCHAR(32),
    after_version VARCHAR(32),
    switch_status VARCHAR(32)  NOT NULL DEFAULT 'pending',
    switched_at   TIMESTAMP,
    remark        VARCHAR(255),
    created_by    BIGINT,
    created_at    TIMESTAMP,
    updated_by    BIGINT,
    updated_at    TIMESTAMP,
    deleted       INT          NOT NULL DEFAULT 0,
    version       INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE INDEX idx_eco_change_item_eco ON eco_change_item (eco_id);

CREATE TABLE eco_notice (
    id           BIGINT        NOT NULL,
    eco_id       BIGINT        NOT NULL,
    eco_no       VARCHAR(64),
    notice_no    VARCHAR(64)   NOT NULL,
    title        VARCHAR(200)  NOT NULL,
    content      VARCHAR(2000),
    target_type  VARCHAR(32)   NOT NULL DEFAULT 'internal',
    target_code  VARCHAR(64),
    target_name  VARCHAR(128),
    status       VARCHAR(32)   NOT NULL DEFAULT 'draft',
    sent_at      TIMESTAMP,
    confirmed_at TIMESTAMP,
    remark       VARCHAR(255),
    created_by   BIGINT,
    created_at   TIMESTAMP,
    updated_by   BIGINT,
    updated_at   TIMESTAMP,
    deleted      INT           NOT NULL DEFAULT 0,
    version      INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_eco_notice_no ON eco_notice (notice_no);
CREATE INDEX idx_eco_notice_eco ON eco_notice (eco_id);

CREATE TABLE eco_impact_analysis (
    id            BIGINT       NOT NULL,
    eco_id        BIGINT       NOT NULL,
    impact_type   VARCHAR(32)  NOT NULL,
    object_code   VARCHAR(64),
    object_name   VARCHAR(200),
    current_value VARCHAR(255),
    impact_desc   VARCHAR(500),
    handle_status VARCHAR(32)  NOT NULL DEFAULT 'pending',
    handle_remark VARCHAR(500),
    handled_at    TIMESTAMP,
    created_by    BIGINT,
    created_at    TIMESTAMP,
    updated_by    BIGINT,
    updated_at    TIMESTAMP,
    deleted       INT          NOT NULL DEFAULT 0,
    version       INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE INDEX idx_eco_impact_eco ON eco_impact_analysis (eco_id);
