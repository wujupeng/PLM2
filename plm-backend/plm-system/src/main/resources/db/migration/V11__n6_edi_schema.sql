-- N6 EDI 客户需求与供应商协同：EDI 伙伴与通道、交易集配置、报文映射、供应商供货关系、
-- 原始报文与解析结果、客户需求标准对象与变更留痕、需求分发、供应商确认回执、ASN、EDI 交易日志
-- 说明：SQL 同时兼容 PostgreSQL 与 H2（PostgreSQL 兼容模式），主键由应用侧雪花算法生成。

-- ========== DEV-063 EDI 伙伴与通道管理 ==========

CREATE TABLE edi_partner (
    id               BIGINT       NOT NULL,
    partner_code     VARCHAR(64)  NOT NULL,
    partner_name     VARCHAR(128) NOT NULL,
    partner_type     VARCHAR(16)  NOT NULL DEFAULT 'CUSTOMER',
    partner_id       VARCHAR(64),
    protocol         VARCHAR(16)  NOT NULL DEFAULT 'SFTP',
    endpoint         VARCHAR(255),
    port             INT,
    remote_path      VARCHAR(255),
    username         VARCHAR(128),
    secret_ref       VARCHAR(255),
    cert_subject     VARCHAR(255),
    cert_expire_date DATE,
    charset          VARCHAR(32)  DEFAULT 'UTF-8',
    contact          VARCHAR(64),
    email            VARCHAR(128),
    status           VARCHAR(16)  NOT NULL DEFAULT 'enabled',
    remark           VARCHAR(255),
    created_by       BIGINT,
    created_at       TIMESTAMP,
    updated_by       BIGINT,
    updated_at       TIMESTAMP,
    deleted          INT          NOT NULL DEFAULT 0,
    version          INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_edi_partner_code ON edi_partner (partner_code);
CREATE INDEX idx_edi_partner_type ON edi_partner (partner_type);
CREATE INDEX idx_edi_partner_protocol ON edi_partner (protocol);

-- ========== DEV-074 EDI 交易集配置 ==========

CREATE TABLE edi_transaction_set (
    id               BIGINT       NOT NULL,
    partner_code     VARCHAR(64)  NOT NULL DEFAULT '*',
    trans_code       VARCHAR(16)  NOT NULL,
    trans_name       VARCHAR(128),
    direction        VARCHAR(16)  NOT NULL DEFAULT 'INBOUND',
    standard         VARCHAR(16)  NOT NULL DEFAULT 'X12',
    std_version      VARCHAR(32),
    header_seg_tag   VARCHAR(16),
    line_seg_tag     VARCHAR(16),
    ack_trans_code   VARCHAR(16),
    ack_required     INT          NOT NULL DEFAULT 1,
    status           VARCHAR(16)  NOT NULL DEFAULT 'enabled',
    description      VARCHAR(500),
    remark           VARCHAR(255),
    created_by       BIGINT,
    created_at       TIMESTAMP,
    updated_by       BIGINT,
    updated_at       TIMESTAMP,
    deleted          INT          NOT NULL DEFAULT 0,
    version          INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_edi_trans_set ON edi_transaction_set (partner_code, trans_code, direction);
CREATE INDEX idx_edi_trans_set_code ON edi_transaction_set (trans_code);

-- ========== DEV-067 报文映射与标准化 ==========

CREATE TABLE edi_message_map (
    id             BIGINT       NOT NULL,
    map_code       VARCHAR(64)  NOT NULL,
    map_name       VARCHAR(128) NOT NULL,
    partner_code   VARCHAR(64)  NOT NULL DEFAULT '*',
    trans_code     VARCHAR(16)  NOT NULL,
    standard       VARCHAR(16)  NOT NULL DEFAULT 'X12',
    direction      VARCHAR(16)  NOT NULL DEFAULT 'INBOUND',
    scope          VARCHAR(16)  NOT NULL DEFAULT 'HEADER',
    source_path    VARCHAR(255) NOT NULL,
    target_field   VARCHAR(64)  NOT NULL,
    transform_type VARCHAR(16)  NOT NULL DEFAULT 'DIRECT',
    dict_type      VARCHAR(64),
    date_pattern   VARCHAR(32),
    default_value  VARCHAR(128),
    required_flag  INT          NOT NULL DEFAULT 0,
    sort_no        INT          NOT NULL DEFAULT 0,
    status         INT          NOT NULL DEFAULT 1,
    remark         VARCHAR(255),
    created_by     BIGINT,
    created_at     TIMESTAMP,
    updated_by     BIGINT,
    updated_at     TIMESTAMP,
    deleted        INT          NOT NULL DEFAULT 0,
    version        INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_edi_message_map ON edi_message_map (partner_code, trans_code, map_code, scope, source_path);
CREATE INDEX idx_edi_message_map_trans ON edi_message_map (trans_code);

-- ========== DEV-070 供应商供货关系与分配规则（分发依据） ==========

CREATE TABLE edi_supplier_material (
    id             BIGINT        NOT NULL,
    supplier_code  VARCHAR(64)   NOT NULL,
    supplier_name  VARCHAR(128),
    material_code  VARCHAR(64)   NOT NULL,
    share_pct      DECIMAL(5, 2) NOT NULL DEFAULT 100.00,
    lead_time_days INT,
    priority       INT           NOT NULL DEFAULT 1,
    send_channel   VARCHAR(16)   NOT NULL DEFAULT 'API',
    status         INT           NOT NULL DEFAULT 1,
    remark         VARCHAR(255),
    created_by     BIGINT,
    created_at     TIMESTAMP,
    updated_by     BIGINT,
    updated_at     TIMESTAMP,
    deleted        INT           NOT NULL DEFAULT 0,
    version        INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_edi_supplier_material ON edi_supplier_material (supplier_code, material_code);
CREATE INDEX idx_edi_supplier_material_mat ON edi_supplier_material (material_code);

-- ========== DEV-064 / DEV-065 / DEV-066 / DEV-068 原始报文与解析结果 ==========

CREATE TABLE edi_raw_message (
    id             BIGINT       NOT NULL,
    message_no     VARCHAR(64)  NOT NULL,
    control_no     VARCHAR(64),
    partner_code   VARCHAR(64),
    trans_code     VARCHAR(16),
    direction      VARCHAR(16)  NOT NULL DEFAULT 'INBOUND',
    standard       VARCHAR(16)  NOT NULL DEFAULT 'X12',
    protocol       VARCHAR(16),
    file_name      VARCHAR(255),
    raw_content    TEXT,
    raw_size       INT,
    checksum       VARCHAR(64),
    received_at    TIMESTAMP,
    parse_status   VARCHAR(16)  NOT NULL DEFAULT 'RECEIVED',
    parse_message  VARCHAR(500),
    parsed_json    TEXT,
    duplicate_flag INT          NOT NULL DEFAULT 0,
    retry_count    INT          NOT NULL DEFAULT 0,
    last_retry_at  TIMESTAMP,
    related_doc_no VARCHAR(64),
    remark         VARCHAR(255),
    created_by     BIGINT,
    created_at     TIMESTAMP,
    updated_by     BIGINT,
    updated_at     TIMESTAMP,
    deleted        INT          NOT NULL DEFAULT 0,
    version        INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_edi_raw_message_no ON edi_raw_message (message_no);
CREATE INDEX idx_edi_raw_message_ctrl ON edi_raw_message (partner_code, trans_code, control_no);
CREATE INDEX idx_edi_raw_message_checksum ON edi_raw_message (checksum);
CREATE INDEX idx_edi_raw_message_status ON edi_raw_message (parse_status);

-- ========== DEV-066 / DEV-067 / DEV-069 客户需求标准对象与变更留痕 ==========

CREATE TABLE edi_customer_demand (
    id                 BIGINT        NOT NULL,
    demand_no          VARCHAR(64)   NOT NULL,
    message_no         VARCHAR(64),
    partner_code       VARCHAR(64),
    trans_code         VARCHAR(16),
    doc_type           VARCHAR(32)   NOT NULL DEFAULT 'ORDER',
    demand_version     INT           NOT NULL DEFAULT 1,
    customer_order_no  VARCHAR(64),
    customer_line_no   VARCHAR(32),
    customer_code      VARCHAR(64),
    material_code      VARCHAR(64),
    product_code       VARCHAR(64),
    qty                DECIMAL(18, 4) NOT NULL DEFAULT 0,
    unit               VARCHAR(32),
    required_date      DATE,
    ship_to            VARCHAR(128),
    plant_code         VARCHAR(64),
    status             VARCHAR(16)   NOT NULL DEFAULT 'NEW',
    change_type        VARCHAR(16),
    prev_qty           DECIMAL(18, 4),
    prev_required_date DATE,
    change_reason      VARCHAR(255),
    remark             VARCHAR(255),
    created_by         BIGINT,
    created_at         TIMESTAMP,
    updated_by         BIGINT,
    updated_at         TIMESTAMP,
    deleted            INT           NOT NULL DEFAULT 0,
    version            INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_edi_customer_demand_no ON edi_customer_demand (demand_no);
CREATE INDEX idx_edi_demand_order ON edi_customer_demand (customer_order_no, customer_line_no);
CREATE INDEX idx_edi_demand_material ON edi_customer_demand (material_code);
CREATE INDEX idx_edi_demand_status ON edi_customer_demand (status);
CREATE INDEX idx_edi_demand_message ON edi_customer_demand (message_no);

CREATE TABLE edi_demand_change_log (
    id            BIGINT        NOT NULL,
    demand_id     BIGINT,
    demand_no     VARCHAR(64),
    change_type   VARCHAR(16),
    prev_qty      DECIMAL(18, 4),
    new_qty       DECIMAL(18, 4),
    prev_date     DATE,
    new_date      DATE,
    prev_version  INT,
    new_version   INT,
    message_no    VARCHAR(64),
    change_reason VARCHAR(255),
    operator_name VARCHAR(64),
    changed_at    TIMESTAMP,
    remark        VARCHAR(255),
    created_by    BIGINT,
    created_at    TIMESTAMP,
    updated_by    BIGINT,
    updated_at    TIMESTAMP,
    deleted       INT           NOT NULL DEFAULT 0,
    version       INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_edi_demand_change_no ON edi_demand_change_log (id);
CREATE INDEX idx_edi_demand_change_demand ON edi_demand_change_log (demand_no);

-- ========== DEV-070 需求向供应商分发 ==========

CREATE TABLE edi_demand_dispatch (
    id              BIGINT        NOT NULL,
    dispatch_no     VARCHAR(64)   NOT NULL,
    demand_id       BIGINT,
    demand_no       VARCHAR(64),
    supplier_code   VARCHAR(64),
    supplier_name   VARCHAR(128),
    material_code   VARCHAR(64),
    qty             DECIMAL(18, 4) NOT NULL DEFAULT 0,
    unit            VARCHAR(32),
    required_date   DATE,
    demand_version  INT,
    allocation_rule VARCHAR(32),
    share_pct       DECIMAL(5, 2),
    send_channel    VARCHAR(16)   NOT NULL DEFAULT 'API',
    send_status     VARCHAR(16)   NOT NULL DEFAULT 'PENDING',
    retry_count     INT           NOT NULL DEFAULT 0,
    sent_at         TIMESTAMP,
    ack_at          TIMESTAMP,
    ack_status      VARCHAR(16),
    fail_reason     VARCHAR(500),
    remark          VARCHAR(255),
    created_by      BIGINT,
    created_at      TIMESTAMP,
    updated_by      BIGINT,
    updated_at      TIMESTAMP,
    deleted         INT           NOT NULL DEFAULT 0,
    version         INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_edi_dispatch_no ON edi_demand_dispatch (dispatch_no);
CREATE INDEX idx_edi_dispatch_demand ON edi_demand_dispatch (demand_no);
CREATE INDEX idx_edi_dispatch_supplier ON edi_demand_dispatch (supplier_code);
CREATE INDEX idx_edi_dispatch_status ON edi_demand_dispatch (send_status);

-- ========== DEV-071 供应商确认与回执 ==========

CREATE TABLE edi_supplier_ack (
    id              BIGINT        NOT NULL,
    ack_no          VARCHAR(64)   NOT NULL,
    dispatch_id     BIGINT,
    dispatch_no     VARCHAR(64),
    supplier_code   VARCHAR(64),
    ack_type        VARCHAR(16)   NOT NULL DEFAULT 'CONFIRM',
    confirmed_qty   DECIMAL(18, 4),
    confirmed_date  DATE,
    shortage_qty    DECIMAL(18, 4),
    shortage_reason VARCHAR(500),
    exception_text  VARCHAR(500),
    diff_flag       INT           NOT NULL DEFAULT 0,
    source          VARCHAR(16)   NOT NULL DEFAULT 'API',
    ack_at          TIMESTAMP,
    remark          VARCHAR(255),
    created_by      BIGINT,
    created_at      TIMESTAMP,
    updated_by      BIGINT,
    updated_at      TIMESTAMP,
    deleted         INT           NOT NULL DEFAULT 0,
    version         INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_edi_supplier_ack_no ON edi_supplier_ack (ack_no);
CREATE INDEX idx_edi_ack_dispatch ON edi_supplier_ack (dispatch_no);

-- ========== DEV-072 ASN 与交付反馈 ==========

CREATE TABLE edi_asn (
    id            BIGINT        NOT NULL,
    asn_no        VARCHAR(64)   NOT NULL,
    dispatch_no   VARCHAR(64),
    demand_no     VARCHAR(64),
    trans_code    VARCHAR(16)   DEFAULT '856',
    asn_type      VARCHAR(16)   NOT NULL DEFAULT 'OUTBOUND',
    customer_code VARCHAR(64),
    supplier_code VARCHAR(64),
    ship_to       VARCHAR(128),
    carrier       VARCHAR(64),
    tracking_no   VARCHAR(64),
    plate_no      VARCHAR(32),
    ship_date     DATE,
    eta_date      DATE,
    total_qty     DECIMAL(18, 4) NOT NULL DEFAULT 0,
    package_count INT           NOT NULL DEFAULT 0,
    status        VARCHAR(16)   NOT NULL DEFAULT 'CREATED',
    send_at       TIMESTAMP,
    ack_at        TIMESTAMP,
    remark        VARCHAR(255),
    created_by    BIGINT,
    created_at    TIMESTAMP,
    updated_by    BIGINT,
    updated_at    TIMESTAMP,
    deleted       INT           NOT NULL DEFAULT 0,
    version       INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_edi_asn_no ON edi_asn (asn_no);
CREATE INDEX idx_edi_asn_demand ON edi_asn (demand_no);
CREATE INDEX idx_edi_asn_status ON edi_asn (status);

CREATE TABLE edi_asn_line (
    id            BIGINT        NOT NULL,
    asn_id        BIGINT        NOT NULL,
    asn_no        VARCHAR(64),
    line_no       INT           NOT NULL DEFAULT 1,
    material_code VARCHAR(64),
    qty           DECIMAL(18, 4) NOT NULL DEFAULT 0,
    unit          VARCHAR(32),
    batch_no      VARCHAR(64),
    package_code  VARCHAR(64),
    box_code      VARCHAR(64),
    remark        VARCHAR(255),
    created_by    BIGINT,
    created_at    TIMESTAMP,
    updated_by    BIGINT,
    updated_at    TIMESTAMP,
    deleted       INT           NOT NULL DEFAULT 0,
    version       INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE INDEX idx_edi_asn_line_asn ON edi_asn_line (asn_id);

-- ========== DEV-073 EDI 交易日志（监控、重试、重放、人工修复） ==========

CREATE TABLE edi_transaction_log (
    id            BIGINT        NOT NULL,
    log_no        VARCHAR(64)   NOT NULL,
    message_no    VARCHAR(64),
    partner_code  VARCHAR(64),
    trans_code    VARCHAR(16),
    direction     VARCHAR(16),
    action_type   VARCHAR(16)   NOT NULL,
    result        VARCHAR(16)   NOT NULL DEFAULT 'SUCCESS',
    message       VARCHAR(1000),
    ref_no        VARCHAR(64),
    operator_id   BIGINT,
    operator_name VARCHAR(64),
    log_at        TIMESTAMP,
    remark        VARCHAR(255),
    created_by    BIGINT,
    created_at    TIMESTAMP,
    updated_by    BIGINT,
    updated_at    TIMESTAMP,
    deleted       INT           NOT NULL DEFAULT 0,
    version       INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_edi_transaction_log_no ON edi_transaction_log (log_no);
CREATE INDEX idx_edi_log_message ON edi_transaction_log (message_no);
CREATE INDEX idx_edi_log_action ON edi_transaction_log (action_type);
CREATE INDEX idx_edi_log_at ON edi_transaction_log (log_at);
