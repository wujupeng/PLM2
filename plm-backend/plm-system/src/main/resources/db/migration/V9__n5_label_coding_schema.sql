-- N5 客户标签编码与扫描换标：编码规则与分段、统一码表、每日流水号、原码到新码映射、
-- 标签模板、标签打印任务与打印日志、扫描换标日志
-- 说明：SQL 同时兼容 PostgreSQL 与 H2（PostgreSQL 兼容模式），主键由应用侧雪花算法生成。
-- 编码规则采用“规则头 + 分段定义”的方式建模，14 位 / 24 位 / 28 位均由分段配置驱动，便于按客户与项目差异化配置。

-- ========== 编码规则（DEV-051 / DEV-052 / DEV-062） ==========

CREATE TABLE code_rule (
    id             BIGINT       NOT NULL,
    rule_code      VARCHAR(64)  NOT NULL,
    rule_name      VARCHAR(128) NOT NULL,
    code_type      VARCHAR(32)  NOT NULL DEFAULT 'CODE24',
    rule_version   VARCHAR(32)  NOT NULL DEFAULT 'V1',
    customer_code  VARCHAR(64),
    project_code   VARCHAR(64),
    plant_code     VARCHAR(32),
    total_length   INT          NOT NULL DEFAULT 24,
    seq_dimension  VARCHAR(32)  NOT NULL DEFAULT 'DAY',
    seq_start      INT          NOT NULL DEFAULT 1,
    seq_end        INT          NOT NULL DEFAULT 9999,
    seq_length     INT          NOT NULL DEFAULT 4,
    is_default     INT          NOT NULL DEFAULT 0,
    status         VARCHAR(32)  NOT NULL DEFAULT 'draft',
    effective_date DATE,
    expire_date    DATE,
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
CREATE UNIQUE INDEX uk_code_rule_code ON code_rule (rule_code, rule_version);
CREATE INDEX idx_code_rule_type ON code_rule (code_type);
CREATE INDEX idx_code_rule_customer ON code_rule (customer_code);

CREATE TABLE code_rule_segment (
    id           BIGINT       NOT NULL,
    rule_id      BIGINT       NOT NULL,
    seg_no       INT          NOT NULL DEFAULT 1,
    seg_name     VARCHAR(128) NOT NULL,
    seg_key      VARCHAR(64)  NOT NULL,
    start_pos    INT          NOT NULL,
    end_pos      INT          NOT NULL,
    seg_length   INT          NOT NULL,
    value_type   VARCHAR(32)  NOT NULL DEFAULT 'FIXED',
    fixed_value  VARCHAR(64),
    field_key    VARCHAR(64),
    dict_type    VARCHAR(64),
    date_pattern VARCHAR(32),
    day_offset   INT          NOT NULL DEFAULT 0,
    fill_char    VARCHAR(4)   NOT NULL DEFAULT '0',
    fill_mode    VARCHAR(16)  NOT NULL DEFAULT 'LEFT',
    source_ref   VARCHAR(255),
    sort_no      INT          NOT NULL DEFAULT 0,
    status       INT          NOT NULL DEFAULT 1,
    remark       VARCHAR(255),
    created_by   BIGINT,
    created_at   TIMESTAMP,
    updated_by   BIGINT,
    updated_at   TIMESTAMP,
    deleted      INT          NOT NULL DEFAULT 0,
    version      INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE INDEX idx_code_rule_segment_rule ON code_rule_segment (rule_id);

-- ========== 统一码表（DEV-053） ==========

CREATE TABLE code_dictionary (
    id         BIGINT       NOT NULL,
    dict_type  VARCHAR(64)  NOT NULL,
    dict_code  VARCHAR(64)  NOT NULL,
    dict_name  VARCHAR(128) NOT NULL,
    ext_value  VARCHAR(64),
    ext_text   VARCHAR(255),
    sort_no    INT          NOT NULL DEFAULT 0,
    status     INT          NOT NULL DEFAULT 1,
    remark     VARCHAR(255),
    created_by BIGINT,
    created_at TIMESTAMP,
    updated_by BIGINT,
    updated_at TIMESTAMP,
    deleted    INT          NOT NULL DEFAULT 0,
    version    INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_code_dictionary ON code_dictionary (dict_type, dict_code);
CREATE INDEX idx_code_dictionary_type ON code_dictionary (dict_type);

-- ========== 每日流水号（DEV-055） ==========
-- seq_key 由“规则维度 + 序号维度标识”组合而成，例如 CODE24|P00|XA|12285499|2026366；
-- 采用行级锁（SELECT ... FOR UPDATE）+ 递增更新的方式保证并发安全。

CREATE TABLE code_sequence (
    id                BIGINT       NOT NULL,
    seq_key           VARCHAR(255) NOT NULL,
    seq_dimension     VARCHAR(32)  NOT NULL DEFAULT 'DAY',
    seq_date          DATE,
    init_value        INT          NOT NULL DEFAULT 1,
    current_value     INT          NOT NULL DEFAULT 0,
    max_value         INT          NOT NULL DEFAULT 9999,
    warn_threshold    INT          NOT NULL DEFAULT 0,
    warn_flag         INT          NOT NULL DEFAULT 0,
    last_generated_at TIMESTAMP,
    remark            VARCHAR(255),
    created_by        BIGINT,
    created_at        TIMESTAMP,
    updated_by        BIGINT,
    updated_at        TIMESTAMP,
    deleted           INT          NOT NULL DEFAULT 0,
    version           INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_code_sequence_key ON code_sequence (seq_key);

-- ========== 原码到新码映射（DEV-057） ==========

CREATE TABLE code_mapping (
    id               BIGINT       NOT NULL,
    source_code      VARCHAR(128) NOT NULL,
    source_code_type VARCHAR(32)  NOT NULL DEFAULT 'CODE14',
    source_rule_code VARCHAR(64),
    target_code      VARCHAR(64)  NOT NULL,
    target_code_type VARCHAR(32)  NOT NULL DEFAULT 'CODE24',
    rule_id          BIGINT,
    rule_code        VARCHAR(64),
    product_code     VARCHAR(64),
    material_code    VARCHAR(64),
    batch_no         VARCHAR(64),
    qty              INT          NOT NULL DEFAULT 1,
    plant_code       VARCHAR(32),
    customer_code    VARCHAR(64),
    version_no       VARCHAR(32),
    status           VARCHAR(32)  NOT NULL DEFAULT 'active',
    scan_count       INT          NOT NULL DEFAULT 1,
    first_scan_at    TIMESTAMP,
    last_scan_at     TIMESTAMP,
    operator_id      BIGINT,
    operator_name    VARCHAR(64),
    print_task_no    VARCHAR(64),
    remark           VARCHAR(255),
    created_by       BIGINT,
    created_at       TIMESTAMP,
    updated_by       BIGINT,
    updated_at       TIMESTAMP,
    deleted          INT          NOT NULL DEFAULT 0,
    version          INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_code_mapping_source ON code_mapping (source_code);
CREATE INDEX idx_code_mapping_target ON code_mapping (target_code);
CREATE INDEX idx_code_mapping_product ON code_mapping (product_code);

-- ========== 标签模板（DEV-059） ==========

CREATE TABLE label_template (
    id               BIGINT       NOT NULL,
    template_code    VARCHAR(64)  NOT NULL,
    template_name    VARCHAR(128) NOT NULL,
    template_version VARCHAR(32)  NOT NULL DEFAULT 'V1',
    label_type       VARCHAR(32)  NOT NULL DEFAULT 'CODE24',
    paper_width      DECIMAL(10, 2) NOT NULL DEFAULT 50.00,
    paper_height     DECIMAL(10, 2) NOT NULL DEFAULT 30.00,
    unit             VARCHAR(16)  NOT NULL DEFAULT 'mm',
    dpi              INT          NOT NULL DEFAULT 300,
    barcode_type     VARCHAR(32)  NOT NULL DEFAULT 'DATA_MATRIX',
    dm_symbol_size   VARCHAR(32),
    dm_ecc_level     VARCHAR(16)  NOT NULL DEFAULT 'ECC200',
    module_size      DECIMAL(10, 2) NOT NULL DEFAULT 0.40,
    element_json     TEXT,
    layout_json      TEXT,
    status           VARCHAR(32)  NOT NULL DEFAULT 'draft',
    remark           VARCHAR(255),
    created_by       BIGINT,
    created_at       TIMESTAMP,
    updated_by       BIGINT,
    updated_at       TIMESTAMP,
    deleted          INT          NOT NULL DEFAULT 0,
    version          INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_label_template_code ON label_template (template_code, template_version);

-- ========== 标签打印任务与日志（DEV-060） ==========

CREATE TABLE label_print_task (
    id             BIGINT       NOT NULL,
    task_no        VARCHAR(64)  NOT NULL,
    template_id    BIGINT,
    template_code  VARCHAR(64),
    label_type     VARCHAR(32)  NOT NULL DEFAULT 'CODE24',
    source_code    VARCHAR(128),
    target_code    VARCHAR(64)  NOT NULL,
    product_code   VARCHAR(64),
    material_code  VARCHAR(64),
    qty            INT          NOT NULL DEFAULT 1,
    printed_qty    INT          NOT NULL DEFAULT 1,
    reprint_flag   INT          NOT NULL DEFAULT 0,
    reprint_reason VARCHAR(255),
    origin_task_no VARCHAR(64),
    printer_name   VARCHAR(128),
    print_status   VARCHAR(32)  NOT NULL DEFAULT 'success',
    print_at       TIMESTAMP,
    content_text   TEXT,
    scan_log_id    BIGINT,
    operator_id    BIGINT,
    operator_name  VARCHAR(64),
    remark         VARCHAR(255),
    created_by     BIGINT,
    created_at     TIMESTAMP,
    updated_by     BIGINT,
    updated_at     TIMESTAMP,
    deleted        INT          NOT NULL DEFAULT 0,
    version        INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_label_print_task_no ON label_print_task (task_no);
CREATE INDEX idx_label_print_task_target ON label_print_task (target_code);

CREATE TABLE label_print_log (
    id            BIGINT       NOT NULL,
    task_id       BIGINT,
    task_no       VARCHAR(64),
    action_type   VARCHAR(32)  NOT NULL DEFAULT 'PRINT',
    target_code   VARCHAR(64),
    template_code VARCHAR(64),
    printer_name  VARCHAR(128),
    result        VARCHAR(32)  NOT NULL DEFAULT 'success',
    message       VARCHAR(1000),
    print_at      TIMESTAMP,
    operator_id   BIGINT,
    operator_name VARCHAR(64),
    remark        VARCHAR(255),
    created_by    BIGINT,
    created_at    TIMESTAMP,
    updated_by    BIGINT,
    updated_at    TIMESTAMP,
    deleted       INT          NOT NULL DEFAULT 0,
    version       INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE INDEX idx_label_print_log_task ON label_print_log (task_id);
CREATE INDEX idx_label_print_log_target ON label_print_log (target_code);

-- ========== 扫描换标日志（DEV-056 / DEV-061） ==========

CREATE TABLE scan_log (
    id           BIGINT       NOT NULL,
    scan_no      VARCHAR(64)  NOT NULL,
    source_code  VARCHAR(128) NOT NULL,
    source_type  VARCHAR(32),
    parse_json   TEXT,
    valid_flag   INT          NOT NULL DEFAULT 0,
    fail_reason  VARCHAR(500),
    target_code  VARCHAR(64),
    mapping_id   BIGINT,
    action_type  VARCHAR(32)  NOT NULL DEFAULT 'NEW',
    reprint_flag INT          NOT NULL DEFAULT 0,
    rule_code    VARCHAR(64),
    terminal_no  VARCHAR(64),
    operator_id  BIGINT,
    operator_name VARCHAR(64),
    scan_at      TIMESTAMP,
    remark       VARCHAR(255),
    created_by   BIGINT,
    created_at   TIMESTAMP,
    updated_by   BIGINT,
    updated_at   TIMESTAMP,
    deleted      INT          NOT NULL DEFAULT 0,
    version      INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_scan_log_no ON scan_log (scan_no);
CREATE INDEX idx_scan_log_source ON scan_log (source_code);
CREATE INDEX idx_scan_log_target ON scan_log (target_code);
