-- G4-N1 SRM—供应商全生命周期（WBS T031）表结构。
-- 主数据权责：SRM 为供应商档案/准入权威源；ERP 侧 erp_supplier 为业务扩展引用（以 supplier_code 关联）。
-- 覆盖范围：准入、资质、风险、分级、黑名单、年度复审。

-- ========== 1. 供应商主档（权威源） ==========

CREATE TABLE srm_supplier (
    id                  BIGINT       NOT NULL,
    supplier_code       VARCHAR(64)  NOT NULL,
    supplier_name       VARCHAR(200) NOT NULL,
    short_name          VARCHAR(128),
    supplier_type       VARCHAR(32)  NOT NULL DEFAULT 'RAW',
    unified_social_code VARCHAR(64),
    legal_person        VARCHAR(64),
    registered_capital  DECIMAL(18, 2),
    business_scope      VARCHAR(1000),
    region              VARCHAR(128),
    industry            VARCHAR(128),
    contact             VARCHAR(64),
    phone               VARCHAR(32),
    email               VARCHAR(128),
    address             VARCHAR(255),
    grade_level         VARCHAR(16),
    supplier_status     VARCHAR(32)  NOT NULL DEFAULT 'PENDING',
    blacklist_flag      INT          NOT NULL DEFAULT 0,
    admission_date      DATE,
    source              VARCHAR(64),
    org_id              BIGINT,
    org_name            VARCHAR(128),
    description         VARCHAR(1000),
    remark              VARCHAR(500),
    created_by          BIGINT,
    created_at          TIMESTAMP,
    updated_by          BIGINT,
    updated_at          TIMESTAMP,
    deleted             INT          NOT NULL DEFAULT 0,
    version             INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_srm_supplier_code ON srm_supplier (supplier_code);
CREATE INDEX idx_srm_supplier_type ON srm_supplier (supplier_type);
CREATE INDEX idx_srm_supplier_status ON srm_supplier (supplier_status);

-- ========== 2. 供应商准入 ==========

CREATE TABLE srm_supplier_admission (
    id                 BIGINT        NOT NULL,
    admission_no       VARCHAR(64)   NOT NULL,
    supplier_code      VARCHAR(64),
    supplier_name      VARCHAR(200),
    admission_type     VARCHAR(32)   NOT NULL DEFAULT 'NEW',
    source             VARCHAR(64),
    apply_by           VARCHAR(64),
    apply_date         DATE,
    assess_score       DECIMAL(10, 2),
    assess_conclusion  VARCHAR(1000),
    approver           VARCHAR(64),
    approve_date       DATE,
    admission_status   VARCHAR(32)   NOT NULL DEFAULT 'DRAFT',
    org_id             BIGINT,
    org_name           VARCHAR(128),
    description        VARCHAR(1000),
    remark             VARCHAR(500),
    created_by         BIGINT,
    created_at         TIMESTAMP,
    updated_by         BIGINT,
    updated_at         TIMESTAMP,
    deleted            INT           NOT NULL DEFAULT 0,
    version            INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_srm_supplier_admission_no ON srm_supplier_admission (admission_no);
CREATE INDEX idx_srm_supplier_admission_supplier ON srm_supplier_admission (supplier_code);
CREATE INDEX idx_srm_supplier_admission_status ON srm_supplier_admission (admission_status);

-- ========== 3. 供应商资质 ==========

CREATE TABLE srm_supplier_qualification (
    id                   BIGINT       NOT NULL,
    qualification_no     VARCHAR(64)  NOT NULL,
    supplier_code        VARCHAR(64),
    supplier_name        VARCHAR(200),
    qualification_type   VARCHAR(32)  NOT NULL DEFAULT 'BUSINESS_LICENSE',
    qualification_name   VARCHAR(200),
    cert_no              VARCHAR(128),
    issue_authority      VARCHAR(200),
    issue_date           DATE,
    expire_date          DATE,
    attachment_url       VARCHAR(500),
    qualification_status VARCHAR(32)  NOT NULL DEFAULT 'VALID',
    org_id               BIGINT,
    org_name             VARCHAR(128),
    description          VARCHAR(1000),
    remark               VARCHAR(500),
    created_by           BIGINT,
    created_at           TIMESTAMP,
    updated_by           BIGINT,
    updated_at           TIMESTAMP,
    deleted              INT          NOT NULL DEFAULT 0,
    version              INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_srm_supplier_qualification_no ON srm_supplier_qualification (qualification_no);
CREATE INDEX idx_srm_supplier_qualification_supplier ON srm_supplier_qualification (supplier_code);
CREATE INDEX idx_srm_supplier_qualification_status ON srm_supplier_qualification (qualification_status);

-- ========== 4. 供应商风险 ==========

CREATE TABLE srm_supplier_risk (
    id             BIGINT        NOT NULL,
    risk_no        VARCHAR(64)   NOT NULL,
    supplier_code  VARCHAR(64),
    supplier_name  VARCHAR(200),
    risk_type      VARCHAR(32)   NOT NULL DEFAULT 'QUALITY',
    risk_level     VARCHAR(16)   NOT NULL DEFAULT 'LOW',
    risk_source    VARCHAR(128),
    risk_desc      VARCHAR(1000),
    discover_date  DATE,
    handle_measure VARCHAR(1000),
    handler        VARCHAR(64),
    handle_date    DATE,
    risk_status    VARCHAR(32)   NOT NULL DEFAULT 'OPEN',
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
CREATE UNIQUE INDEX uk_srm_supplier_risk_no ON srm_supplier_risk (risk_no);
CREATE INDEX idx_srm_supplier_risk_supplier ON srm_supplier_risk (supplier_code);
CREATE INDEX idx_srm_supplier_risk_status ON srm_supplier_risk (risk_status);

-- ========== 5. 供应商分级 ==========

CREATE TABLE srm_supplier_grade (
    id            BIGINT        NOT NULL,
    grade_no      VARCHAR(64)   NOT NULL,
    supplier_code VARCHAR(64),
    supplier_name VARCHAR(200),
    grade_level   VARCHAR(16)   NOT NULL DEFAULT 'C',
    grade_period  VARCHAR(32),
    grade_score   DECIMAL(10, 2),
    grade_basis   VARCHAR(1000),
    evaluator     VARCHAR(64),
    grade_date    DATE,
    grade_status  VARCHAR(32)   NOT NULL DEFAULT 'DRAFT',
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
CREATE UNIQUE INDEX uk_srm_supplier_grade_no ON srm_supplier_grade (grade_no);
CREATE INDEX idx_srm_supplier_grade_supplier ON srm_supplier_grade (supplier_code);
CREATE INDEX idx_srm_supplier_grade_level ON srm_supplier_grade (grade_level);

-- ========== 6. 供应商黑名单 ==========

CREATE TABLE srm_supplier_blacklist (
    id               BIGINT        NOT NULL,
    blacklist_no     VARCHAR(64)   NOT NULL,
    supplier_code    VARCHAR(64),
    supplier_name    VARCHAR(200),
    blacklist_type   VARCHAR(32)   NOT NULL DEFAULT 'TEMPORARY',
    blacklist_reason VARCHAR(1000),
    effective_date   DATE,
    expire_date      DATE,
    apply_by         VARCHAR(64),
    approver         VARCHAR(64),
    approve_date     DATE,
    release_reason   VARCHAR(1000),
    blacklist_status VARCHAR(32)   NOT NULL DEFAULT 'ACTIVE',
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
CREATE UNIQUE INDEX uk_srm_supplier_blacklist_no ON srm_supplier_blacklist (blacklist_no);
CREATE INDEX idx_srm_supplier_blacklist_supplier ON srm_supplier_blacklist (supplier_code);
CREATE INDEX idx_srm_supplier_blacklist_status ON srm_supplier_blacklist (blacklist_status);

-- ========== 7. 供应商年度复审 ==========

CREATE TABLE srm_supplier_review (
    id               BIGINT        NOT NULL,
    review_no        VARCHAR(64)   NOT NULL,
    supplier_code    VARCHAR(64),
    supplier_name    VARCHAR(200),
    review_period    VARCHAR(32),
    review_type      VARCHAR(32)   NOT NULL DEFAULT 'ANNUAL',
    current_grade    VARCHAR(16),
    review_score     DECIMAL(10, 2),
    review_result    VARCHAR(32),
    reviewer         VARCHAR(64),
    review_date      DATE,
    next_review_date DATE,
    review_status    VARCHAR(32)   NOT NULL DEFAULT 'PENDING',
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
CREATE UNIQUE INDEX uk_srm_supplier_review_no ON srm_supplier_review (review_no);
CREATE INDEX idx_srm_supplier_review_supplier ON srm_supplier_review (supplier_code);
CREATE INDEX idx_srm_supplier_review_status ON srm_supplier_review (review_status);
