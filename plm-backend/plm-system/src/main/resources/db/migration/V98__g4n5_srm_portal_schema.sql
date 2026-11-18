-- G4-N5 SRM—供应商门户（WBS T035）表结构。
-- 主数据权责：SRM 为供应商门户权威源；供应商编码引用 SRM 供应商主数据，
-- 订单/交期/送货/质量协同数据引用 G4-N3 采购协同与 G4-N4 供应商质量单据。
-- 覆盖范围：供应商账号、门户消息（订单/交期/送货/质量协同通知）、门户附件。

-- ========== 1. 供应商门户账号 ==========

CREATE TABLE srm_portal_account (
    id             BIGINT        NOT NULL,
    account_no     VARCHAR(64)   NOT NULL,
    supplier_code  VARCHAR(64),
    supplier_name  VARCHAR(200),
    login_name     VARCHAR(64),
    contact_name   VARCHAR(64),
    contact_phone  VARCHAR(32),
    contact_email  VARCHAR(128),
    portal_role    VARCHAR(32)   NOT NULL DEFAULT 'VIEWER',
    collab_scope   VARCHAR(255),
    valid_from     DATE,
    valid_to       DATE,
    account_status VARCHAR(32)   NOT NULL DEFAULT 'DRAFT',
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
CREATE UNIQUE INDEX uk_srm_portal_account_no ON srm_portal_account (account_no);
CREATE INDEX idx_srm_portal_account_supplier ON srm_portal_account (supplier_code);
CREATE INDEX idx_srm_portal_account_login ON srm_portal_account (login_name);
CREATE INDEX idx_srm_portal_account_role ON srm_portal_account (portal_role);
CREATE INDEX idx_srm_portal_account_status ON srm_portal_account (account_status);

-- ========== 2. 供应商门户消息（订单/交期/送货/质量协同通知） ==========

CREATE TABLE srm_portal_message (
    id             BIGINT        NOT NULL,
    message_no     VARCHAR(64)   NOT NULL,
    supplier_code  VARCHAR(64),
    supplier_name  VARCHAR(200),
    message_type   VARCHAR(32)   NOT NULL DEFAULT 'SYSTEM',
    title          VARCHAR(255),
    content        VARCHAR(2000),
    biz_no         VARCHAR(64),
    read_flag      INT           NOT NULL DEFAULT 0,
    sender         VARCHAR(64),
    send_date      DATE,
    message_status VARCHAR(32)   NOT NULL DEFAULT 'DRAFT',
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
CREATE UNIQUE INDEX uk_srm_portal_message_no ON srm_portal_message (message_no);
CREATE INDEX idx_srm_portal_message_supplier ON srm_portal_message (supplier_code);
CREATE INDEX idx_srm_portal_message_type ON srm_portal_message (message_type);
CREATE INDEX idx_srm_portal_message_biz ON srm_portal_message (biz_no);
CREATE INDEX idx_srm_portal_message_status ON srm_portal_message (message_status);

-- ========== 3. 供应商门户附件 ==========

CREATE TABLE srm_portal_attachment (
    id                BIGINT        NOT NULL,
    attachment_no     VARCHAR(64)   NOT NULL,
    biz_type          VARCHAR(32)   NOT NULL DEFAULT 'MESSAGE',
    biz_no            VARCHAR(64),
    supplier_code     VARCHAR(64),
    supplier_name     VARCHAR(200),
    file_name         VARCHAR(255),
    file_path         VARCHAR(500),
    file_type         VARCHAR(32),
    file_size         BIGINT,
    uploader          VARCHAR(64),
    upload_date       DATE,
    attachment_status VARCHAR(32)   NOT NULL DEFAULT 'PENDING',
    org_id            BIGINT,
    org_name          VARCHAR(128),
    description       VARCHAR(1000),
    remark            VARCHAR(500),
    created_by        BIGINT,
    created_at        TIMESTAMP,
    updated_by        BIGINT,
    updated_at        TIMESTAMP,
    deleted           INT           NOT NULL DEFAULT 0,
    version           INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_srm_portal_attachment_no ON srm_portal_attachment (attachment_no);
CREATE INDEX idx_srm_portal_attachment_biz ON srm_portal_attachment (biz_type, biz_no);
CREATE INDEX idx_srm_portal_attachment_supplier ON srm_portal_attachment (supplier_code);
CREATE INDEX idx_srm_portal_attachment_status ON srm_portal_attachment (attachment_status);
