-- G4-N4 SRM—供应商质量（WBS T034）表结构。
-- 主数据权责：SRM 为供应商质量权威源；物料编码引用 PLM 物料主数据，采购订单号引用 ERP 采购订单。
-- 覆盖范围：来料质量（IQC）、供应商考评（月度/季度/年度）、8D 报告、整改跟踪。

-- ========== 1. 来料质量（来料检验单） ==========

CREATE TABLE srm_incoming_quality (
    id               BIGINT        NOT NULL,
    iqc_no           VARCHAR(64)   NOT NULL,
    po_no            VARCHAR(64),
    supplier_code    VARCHAR(64),
    supplier_name    VARCHAR(200),
    material_code    VARCHAR(64),
    material_name    VARCHAR(200),
    spec             VARCHAR(255),
    batch_no         VARCHAR(64),
    receive_qty      DECIMAL(18, 4),
    unit             VARCHAR(32),
    sample_qty       DECIMAL(18, 4),
    defect_qty       DECIMAL(18, 4),
    defect_rate      DECIMAL(10, 4),
    inspection_result VARCHAR(32)  NOT NULL DEFAULT 'PENDING',
    defect_desc      VARCHAR(1000),
    inspector        VARCHAR(64),
    inspect_date     DATE,
    iqc_status       VARCHAR(32)   NOT NULL DEFAULT 'DRAFT',
    org_id           BIGINT,
    org_name         VARCHAR(128),
    description      VARCHAR(1000),
    remark           VARCHAR(500),
    created_by       BIGINT,
    created_at       TIMESTAMP,
    updated_by       BIGINT,
    updated_at       TIMESTAMP,
    deleted          INT           NOT NULL DEFAULT 0,
    version          INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_srm_iqc_no ON srm_incoming_quality (iqc_no);
CREATE INDEX idx_srm_iqc_po ON srm_incoming_quality (po_no);
CREATE INDEX idx_srm_iqc_supplier ON srm_incoming_quality (supplier_code);
CREATE INDEX idx_srm_iqc_material ON srm_incoming_quality (material_code);
CREATE INDEX idx_srm_iqc_result ON srm_incoming_quality (inspection_result);
CREATE INDEX idx_srm_iqc_status ON srm_incoming_quality (iqc_status);

-- ========== 2. 供应商考评（月度/季度/年度） ==========

CREATE TABLE srm_supplier_assessment (
    id                  BIGINT        NOT NULL,
    assessment_no       VARCHAR(64)   NOT NULL,
    supplier_code       VARCHAR(64),
    supplier_name       VARCHAR(200),
    assessment_period   VARCHAR(32),
    assessment_type     VARCHAR(32)   NOT NULL DEFAULT 'MONTHLY',
    quality_score       DECIMAL(8, 2),
    delivery_score      DECIMAL(8, 2),
    price_score         DECIMAL(8, 2),
    service_score       DECIMAL(8, 2),
    total_score         DECIMAL(8, 2),
    grade_level         VARCHAR(32),
    assessment_result   VARCHAR(500),
    assessor            VARCHAR(64),
    assess_date         DATE,
    assessment_status   VARCHAR(32)   NOT NULL DEFAULT 'DRAFT',
    org_id              BIGINT,
    org_name            VARCHAR(128),
    description         VARCHAR(1000),
    remark              VARCHAR(500),
    created_by          BIGINT,
    created_at          TIMESTAMP,
    updated_by          BIGINT,
    updated_at          TIMESTAMP,
    deleted             INT           NOT NULL DEFAULT 0,
    version             INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_srm_assessment_no ON srm_supplier_assessment (assessment_no);
CREATE INDEX idx_srm_assessment_supplier ON srm_supplier_assessment (supplier_code);
CREATE INDEX idx_srm_assessment_type ON srm_supplier_assessment (assessment_type);
CREATE INDEX idx_srm_assessment_period ON srm_supplier_assessment (assessment_period);
CREATE INDEX idx_srm_assessment_grade ON srm_supplier_assessment (grade_level);
CREATE INDEX idx_srm_assessment_status ON srm_supplier_assessment (assessment_status);

-- ========== 3. 8D 报告 ==========

CREATE TABLE srm_eight_d (
    id             BIGINT        NOT NULL,
    eightd_no      VARCHAR(64)   NOT NULL,
    supplier_code  VARCHAR(64),
    supplier_name  VARCHAR(200),
    material_code  VARCHAR(64),
    material_name  VARCHAR(200),
    spec           VARCHAR(255),
    problem_source VARCHAR(64),
    problem_desc   VARCHAR(2000),
    d1_team        VARCHAR(1000),
    d2_problem     VARCHAR(2000),
    d3_containment VARCHAR(2000),
    d4_root_cause  VARCHAR(2000),
    d5_corrective  VARCHAR(2000),
    d6_implement   VARCHAR(2000),
    d7_prevent     VARCHAR(2000),
    d8_congratulate VARCHAR(1000),
    issue_date     DATE,
    close_date     DATE,
    owner          VARCHAR(64),
    eightd_status  VARCHAR(32)   NOT NULL DEFAULT 'DRAFT',
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
CREATE UNIQUE INDEX uk_srm_eightd_no ON srm_eight_d (eightd_no);
CREATE INDEX idx_srm_eightd_supplier ON srm_eight_d (supplier_code);
CREATE INDEX idx_srm_eightd_material ON srm_eight_d (material_code);
CREATE INDEX idx_srm_eightd_source ON srm_eight_d (problem_source);
CREATE INDEX idx_srm_eightd_status ON srm_eight_d (eightd_status);

-- ========== 4. 整改跟踪 ==========

CREATE TABLE srm_rectification (
    id                    BIGINT        NOT NULL,
    rectification_no      VARCHAR(64)   NOT NULL,
    source_no             VARCHAR(64),
    supplier_code         VARCHAR(64),
    supplier_name         VARCHAR(200),
    material_code         VARCHAR(64),
    material_name         VARCHAR(200),
    issue_desc            VARCHAR(1000),
    rectify_action        VARCHAR(2000),
    responsible           VARCHAR(64),
    plan_date             DATE,
    complete_date         DATE,
    verify_by             VARCHAR(64),
    verify_date           DATE,
    verify_result         VARCHAR(500),
    rectification_status  VARCHAR(32)   NOT NULL DEFAULT 'PENDING',
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
CREATE UNIQUE INDEX uk_srm_rectification_no ON srm_rectification (rectification_no);
CREATE INDEX idx_srm_rectification_source ON srm_rectification (source_no);
CREATE INDEX idx_srm_rectification_supplier ON srm_rectification (supplier_code);
CREATE INDEX idx_srm_rectification_material ON srm_rectification (material_code);
CREATE INDEX idx_srm_rectification_status ON srm_rectification (rectification_status);
