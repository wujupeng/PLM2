-- OA-N8 资产维修与专项业务应用：资产维修、合同管理、办公用品、图书、客户、国际化与多工厂、日志中心与移动后台
-- 说明：SQL 同时兼容 PostgreSQL 与 H2（PostgreSQL 兼容模式），主键由应用侧雪花算法生成。
-- 设计原则：
--   1) 需审批的专项流程（设备维修、合同评审、办公用品申请）复用 OA-N3 工作流引擎承载审批路径，
--      业务单据通过 instance_id / instance_no 关联流程实例，终态由 WorkflowInstanceEvent 回写业务状态。
--   2) 权威数据边界遵循任务书要求，OA 不重复建设权威台账：
--      - 资产台账权威归属资产/财务系统（OA 仅承载维修申请与处理过程，台账同步为可配置开关）；
--      - 客户主数据权威归属 ERP/CRM（OA 轻量客户档案仅承载联系人与流程协同，不产生冲突副本）；
--      - 薪酬与考勤计算权威归属 HR/薪资系统（本节点仅承载薪酬相关流程入口，不重算薪资）；
--      上述边界对应的同步开关均为可配置项（sys_config）并标记待业务方确认。
--   3) 单据编号前缀、维修字段与类别、库存开关、借阅期限、语言/时区默认值、日志保留与移动会话超时等
--      均为可配置项，不写死在代码中。
-- 注意：业务字段一律不得命名为 version，避免与 BaseEntity 的乐观锁字段 version 冲突。

-- ========== 设备维修工单（OA-DEV-078） ==========

CREATE TABLE oa_asset_repair_order (
    id                BIGINT       NOT NULL,
    repair_no         VARCHAR(64)  NOT NULL,
    asset_category    VARCHAR(32)  NOT NULL DEFAULT 'MACHINE',
    asset_code        VARCHAR(64),
    asset_name        VARCHAR(200),
    asset_model       VARCHAR(128),
    location          VARCHAR(128),
    fault_type        VARCHAR(64),
    fault_desc        VARCHAR(2000),
    priority          VARCHAR(16)  NOT NULL DEFAULT 'NORMAL',
    report_time       TIMESTAMP,
    require_finish    DATE,
    applicant_user_id BIGINT       NOT NULL,
    applicant_name    VARCHAR(64),
    org_id            BIGINT,
    org_name          VARCHAR(128),
    repair_status     VARCHAR(32)  NOT NULL DEFAULT 'DRAFT',
    assignee_user_id  BIGINT,
    assignee_name     VARCHAR(64),
    dispatch_time     TIMESTAMP,
    dispatch_remark   VARCHAR(500),
    fault_cause       VARCHAR(1000),
    repair_measure    VARCHAR(1000),
    spare_parts       VARCHAR(500),
    work_hours        DECIMAL(8,2),
    repair_cost       DECIMAL(18,2),
    repair_finish_time TIMESTAMP,
    downtime_minutes  INT,
    repeat_flag       INT          NOT NULL DEFAULT 0,
    accept_result     VARCHAR(32),
    accept_opinion    VARCHAR(500),
    accept_user_id    BIGINT,
    accept_user_name  VARCHAR(64),
    accept_time       TIMESTAMP,
    close_time        TIMESTAMP,
    attachment_json   TEXT,
    flow_status       VARCHAR(32)  NOT NULL DEFAULT 'DRAFT',
    instance_id       BIGINT,
    instance_no       VARCHAR(64),
    cancel_flag       INT          NOT NULL DEFAULT 0,
    remark            VARCHAR(255),
    created_by        BIGINT,
    created_at        TIMESTAMP,
    updated_by        BIGINT,
    updated_at        TIMESTAMP,
    deleted           INT          NOT NULL DEFAULT 0,
    version           INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_oa_asset_repair_no ON oa_asset_repair_order (repair_no);
CREATE INDEX idx_oa_asset_repair_asset ON oa_asset_repair_order (asset_code);
CREATE INDEX idx_oa_asset_repair_status ON oa_asset_repair_order (repair_status);
CREATE INDEX idx_oa_asset_repair_flow ON oa_asset_repair_order (flow_status);

-- ========== 维修知识库（OA-DEV-079） ==========

CREATE TABLE oa_asset_repair_knowledge (
    id                BIGINT       NOT NULL,
    knowledge_no      VARCHAR(64)  NOT NULL,
    asset_category    VARCHAR(32),
    fault_type        VARCHAR(64),
    fault_symptom     VARCHAR(1000),
    fault_cause       VARCHAR(1000),
    solution          VARCHAR(2000),
    spare_parts       VARCHAR(500),
    reference_cost    DECIMAL(18,2),
    source_repair_no  VARCHAR(64),
    keyword           VARCHAR(255),
    hit_count         INT          NOT NULL DEFAULT 0,
    org_id            BIGINT,
    org_name          VARCHAR(128),
    remark            VARCHAR(255),
    created_by        BIGINT,
    created_at        TIMESTAMP,
    updated_by        BIGINT,
    updated_at        TIMESTAMP,
    deleted           INT          NOT NULL DEFAULT 0,
    version           INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_oa_asset_knowledge_no ON oa_asset_repair_knowledge (knowledge_no);
CREATE INDEX idx_oa_asset_knowledge_category ON oa_asset_repair_knowledge (asset_category);
CREATE INDEX idx_oa_asset_knowledge_fault ON oa_asset_repair_knowledge (fault_type);

-- ========== 合同管理（OA-DEV-080） ==========

CREATE TABLE oa_contract (
    id                BIGINT       NOT NULL,
    contract_no       VARCHAR(64)  NOT NULL,
    contract_name     VARCHAR(200) NOT NULL,
    contract_type     VARCHAR(32)  NOT NULL DEFAULT 'SALES',
    customer_code     VARCHAR(64),
    supplier_code     VARCHAR(64),
    party_a           VARCHAR(200),
    party_b           VARCHAR(200),
    amount            DECIMAL(18,2),
    currency          VARCHAR(8)   NOT NULL DEFAULT 'CNY',
    sign_date         DATE,
    effective_date    DATE,
    expire_date       DATE,
    contract_status   VARCHAR(32)  NOT NULL DEFAULT 'DRAFT',
    legal_review_flag INT          NOT NULL DEFAULT 0,
    review_opinion    VARCHAR(1000),
    current_version   INT          NOT NULL DEFAULT 1,
    archive_time      TIMESTAMP,
    applicant_user_id BIGINT       NOT NULL,
    applicant_name    VARCHAR(64),
    org_id            BIGINT,
    org_name          VARCHAR(128),
    attachment_json   TEXT,
    flow_status       VARCHAR(32)  NOT NULL DEFAULT 'DRAFT',
    instance_id       BIGINT,
    instance_no       VARCHAR(64),
    cancel_flag       INT          NOT NULL DEFAULT 0,
    remark            VARCHAR(255),
    created_by        BIGINT,
    created_at        TIMESTAMP,
    updated_by        BIGINT,
    updated_at        TIMESTAMP,
    deleted           INT          NOT NULL DEFAULT 0,
    version           INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_oa_contract_no ON oa_contract (contract_no);
CREATE INDEX idx_oa_contract_status ON oa_contract (contract_status);
CREATE INDEX idx_oa_contract_flow ON oa_contract (flow_status);
CREATE INDEX idx_oa_contract_expire ON oa_contract (expire_date);

CREATE TABLE oa_contract_version (
    id                BIGINT       NOT NULL,
    contract_id       BIGINT       NOT NULL,
    version_no        INT          NOT NULL DEFAULT 1,
    version_desc      VARCHAR(500),
    change_summary    VARCHAR(1000),
    file_name         VARCHAR(255),
    attachment_json   TEXT,
    operator_user_id  BIGINT,
    operator_name     VARCHAR(64),
    remark            VARCHAR(255),
    created_by        BIGINT,
    created_at        TIMESTAMP,
    updated_by        BIGINT,
    updated_at        TIMESTAMP,
    deleted           INT          NOT NULL DEFAULT 0,
    version           INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE INDEX idx_oa_contract_version_contract ON oa_contract_version (contract_id);

-- ========== 办公用品管理（OA-DEV-081） ==========

CREATE TABLE oa_office_supply_item (
    id                BIGINT       NOT NULL,
    item_code         VARCHAR(64)  NOT NULL,
    item_name         VARCHAR(200) NOT NULL,
    category          VARCHAR(64),
    specification     VARCHAR(255),
    unit              VARCHAR(16)  NOT NULL DEFAULT 'PCS',
    unit_price        DECIMAL(18,2),
    stock_qty         DECIMAL(18,2) NOT NULL DEFAULT 0,
    safety_stock      DECIMAL(18,2),
    need_stock        INT          NOT NULL DEFAULT 1,
    status            INT          NOT NULL DEFAULT 1,
    org_id            BIGINT,
    org_name          VARCHAR(128),
    remark            VARCHAR(255),
    created_by        BIGINT,
    created_at        TIMESTAMP,
    updated_by        BIGINT,
    updated_at        TIMESTAMP,
    deleted           INT          NOT NULL DEFAULT 0,
    version           INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_oa_supply_item_code ON oa_office_supply_item (item_code);
CREATE INDEX idx_oa_supply_item_category ON oa_office_supply_item (category);

CREATE TABLE oa_office_supply_request (
    id                BIGINT       NOT NULL,
    request_no        VARCHAR(64)  NOT NULL,
    require_date      DATE,
    purpose           VARCHAR(500),
    item_count        INT          NOT NULL DEFAULT 0,
    total_qty         DECIMAL(18,2) NOT NULL DEFAULT 0,
    issue_status      VARCHAR(32)  NOT NULL DEFAULT 'DRAFT',
    receiver_name     VARCHAR(64),
    issue_time        TIMESTAMP,
    issue_remark      VARCHAR(500),
    applicant_user_id BIGINT       NOT NULL,
    applicant_name    VARCHAR(64),
    org_id            BIGINT,
    org_name          VARCHAR(128),
    attachment_json   TEXT,
    flow_status       VARCHAR(32)  NOT NULL DEFAULT 'DRAFT',
    instance_id       BIGINT,
    instance_no       VARCHAR(64),
    cancel_flag       INT          NOT NULL DEFAULT 0,
    remark            VARCHAR(255),
    created_by        BIGINT,
    created_at        TIMESTAMP,
    updated_by        BIGINT,
    updated_at        TIMESTAMP,
    deleted           INT          NOT NULL DEFAULT 0,
    version           INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_oa_supply_request_no ON oa_office_supply_request (request_no);
CREATE INDEX idx_oa_supply_request_status ON oa_office_supply_request (flow_status);
CREATE INDEX idx_oa_supply_request_issue ON oa_office_supply_request (issue_status);

CREATE TABLE oa_office_supply_request_item (
    id                BIGINT       NOT NULL,
    request_id        BIGINT       NOT NULL,
    item_id           BIGINT,
    item_code         VARCHAR(64),
    item_name         VARCHAR(200),
    unit              VARCHAR(16),
    request_qty       DECIMAL(18,2),
    issue_qty         DECIMAL(18,2),
    sort_no           INT          NOT NULL DEFAULT 1,
    remark            VARCHAR(255),
    created_by        BIGINT,
    created_at        TIMESTAMP,
    updated_by        BIGINT,
    updated_at        TIMESTAMP,
    deleted           INT          NOT NULL DEFAULT 0,
    version           INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE INDEX idx_oa_supply_req_item_req ON oa_office_supply_request_item (request_id);

CREATE TABLE oa_office_supply_txn (
    id                BIGINT       NOT NULL,
    item_id           BIGINT       NOT NULL,
    item_code         VARCHAR(64),
    txn_type          VARCHAR(32)  NOT NULL DEFAULT 'ISSUE',
    txn_qty           DECIMAL(18,2) NOT NULL DEFAULT 0,
    before_qty        DECIMAL(18,2),
    after_qty         DECIMAL(18,2),
    source_no         VARCHAR(64),
    operator_user_id  BIGINT,
    operator_name     VARCHAR(64),
    txn_time          TIMESTAMP,
    remark            VARCHAR(255),
    created_by        BIGINT,
    created_at        TIMESTAMP,
    updated_by        BIGINT,
    updated_at        TIMESTAMP,
    deleted           INT          NOT NULL DEFAULT 0,
    version           INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE INDEX idx_oa_supply_txn_item ON oa_office_supply_txn (item_id);
CREATE INDEX idx_oa_supply_txn_source ON oa_office_supply_txn (source_no);

-- ========== 图书信息管理（OA-DEV-082） ==========

CREATE TABLE oa_library_book (
    id                BIGINT       NOT NULL,
    book_code         VARCHAR(64)  NOT NULL,
    book_name         VARCHAR(200) NOT NULL,
    author            VARCHAR(128),
    publisher         VARCHAR(200),
    isbn              VARCHAR(64),
    category          VARCHAR(64),
    publish_date      DATE,
    location          VARCHAR(128),
    total_qty         INT          NOT NULL DEFAULT 1,
    available_qty     INT          NOT NULL DEFAULT 1,
    status            INT          NOT NULL DEFAULT 1,
    org_id            BIGINT,
    org_name          VARCHAR(128),
    remark            VARCHAR(255),
    created_by        BIGINT,
    created_at        TIMESTAMP,
    updated_by        BIGINT,
    updated_at        TIMESTAMP,
    deleted           INT          NOT NULL DEFAULT 0,
    version           INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_oa_library_book_code ON oa_library_book (book_code);
CREATE INDEX idx_oa_library_book_name ON oa_library_book (book_name);

CREATE TABLE oa_library_borrow (
    id                BIGINT       NOT NULL,
    borrow_no         VARCHAR(64)  NOT NULL,
    book_id           BIGINT       NOT NULL,
    book_code         VARCHAR(64),
    book_name         VARCHAR(200),
    borrower_user_id  BIGINT       NOT NULL,
    borrower_name     VARCHAR(64),
    org_id            BIGINT,
    org_name          VARCHAR(128),
    borrow_date       DATE,
    due_date          DATE,
    return_date       DATE,
    renew_count       INT          NOT NULL DEFAULT 0,
    borrow_status     VARCHAR(32)  NOT NULL DEFAULT 'BORROWED',
    overdue_days      INT          NOT NULL DEFAULT 0,
    remark            VARCHAR(255),
    created_by        BIGINT,
    created_at        TIMESTAMP,
    updated_by        BIGINT,
    updated_at        TIMESTAMP,
    deleted           INT          NOT NULL DEFAULT 0,
    version           INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_oa_library_borrow_no ON oa_library_borrow (borrow_no);
CREATE INDEX idx_oa_library_borrow_book ON oa_library_borrow (book_id);
CREATE INDEX idx_oa_library_borrow_user ON oa_library_borrow (borrower_user_id);
CREATE INDEX idx_oa_library_borrow_status ON oa_library_borrow (borrow_status);

-- ========== 客户管理轻量模块（OA-DEV-083，主数据权威归属待确认） ==========

CREATE TABLE oa_customer (
    id                BIGINT       NOT NULL,
    customer_code     VARCHAR(64)  NOT NULL,
    customer_name     VARCHAR(200) NOT NULL,
    short_name        VARCHAR(128),
    customer_level    VARCHAR(32)  NOT NULL DEFAULT 'NORMAL',
    customer_status   VARCHAR(32)  NOT NULL DEFAULT 'ACTIVE',
    industry          VARCHAR(128),
    region            VARCHAR(128),
    address           VARCHAR(255),
    credit_code       VARCHAR(64),
    tax_no            VARCHAR(64),
    sales_owner_user_id BIGINT,
    sales_owner_name  VARCHAR(64),
    contact_count     INT          NOT NULL DEFAULT 0,
    data_source       VARCHAR(32)  NOT NULL DEFAULT 'OA',
    erp_ref_no        VARCHAR(64),
    org_id            BIGINT,
    org_name          VARCHAR(128),
    remark            VARCHAR(255),
    created_by        BIGINT,
    created_at        TIMESTAMP,
    updated_by        BIGINT,
    updated_at        TIMESTAMP,
    deleted           INT          NOT NULL DEFAULT 0,
    version           INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_oa_customer_code ON oa_customer (customer_code);
CREATE INDEX idx_oa_customer_name ON oa_customer (customer_name);

CREATE TABLE oa_customer_contact (
    id                BIGINT       NOT NULL,
    customer_id       BIGINT       NOT NULL,
    contact_name      VARCHAR(64)  NOT NULL,
    position          VARCHAR(128),
    phone             VARCHAR(64),
    mobile            VARCHAR(64),
    email             VARCHAR(128),
    is_primary        INT          NOT NULL DEFAULT 0,
    remark            VARCHAR(255),
    created_by        BIGINT,
    created_at        TIMESTAMP,
    updated_by        BIGINT,
    updated_at        TIMESTAMP,
    deleted           INT          NOT NULL DEFAULT 0,
    version           INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE INDEX idx_oa_customer_contact_cust ON oa_customer_contact (customer_id);

-- ========== 国际化与多工厂参数（OA-DEV-084） ==========

CREATE TABLE oa_i18n_locale (
    id                BIGINT       NOT NULL,
    locale_code       VARCHAR(32)  NOT NULL,
    locale_name       VARCHAR(64)  NOT NULL,
    language_code     VARCHAR(16),
    country_code      VARCHAR(16),
    timezone          VARCHAR(64),
    date_format       VARCHAR(32),
    time_format       VARCHAR(32),
    number_format     VARCHAR(32),
    currency_code     VARCHAR(8),
    is_default        INT          NOT NULL DEFAULT 0,
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
CREATE UNIQUE INDEX uk_oa_i18n_locale_code ON oa_i18n_locale (locale_code);

CREATE TABLE oa_i18n_message (
    id                BIGINT       NOT NULL,
    locale_code       VARCHAR(32)  NOT NULL,
    message_key       VARCHAR(200) NOT NULL,
    message_value     VARCHAR(1000) NOT NULL,
    module            VARCHAR(64),
    remark            VARCHAR(255),
    created_by        BIGINT,
    created_at        TIMESTAMP,
    updated_by        BIGINT,
    updated_at        TIMESTAMP,
    deleted           INT          NOT NULL DEFAULT 0,
    version           INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE INDEX idx_oa_i18n_message_key ON oa_i18n_message (locale_code, message_key);

CREATE TABLE oa_factory_param (
    id                BIGINT       NOT NULL,
    factory_code      VARCHAR(32)  NOT NULL,
    factory_name      VARCHAR(128) NOT NULL,
    country_code      VARCHAR(16),
    timezone          VARCHAR(64),
    locale_code       VARCHAR(32),
    param_key         VARCHAR(128),
    param_value       VARCHAR(1000),
    org_id            BIGINT,
    org_name          VARCHAR(128),
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
CREATE UNIQUE INDEX uk_oa_factory_code ON oa_factory_param (factory_code);

-- ========== 日志中心与移动后台（OA-DEV-085） ==========

CREATE TABLE oa_sys_log (
    id                BIGINT       NOT NULL,
    log_type          VARCHAR(32)  NOT NULL DEFAULT 'OPERATION',
    log_level         VARCHAR(16)  NOT NULL DEFAULT 'INFO',
    log_module        VARCHAR(64),
    log_title         VARCHAR(255),
    log_content       TEXT,
    biz_type          VARCHAR(64),
    biz_id            VARCHAR(64),
    request_uri       VARCHAR(255),
    http_method       VARCHAR(16),
    operator_user_id  BIGINT,
    operator_name     VARCHAR(64),
    ip_address        VARCHAR(64),
    user_agent        VARCHAR(255),
    error_stack       TEXT,
    alert_flag        INT          NOT NULL DEFAULT 0,
    alert_status      VARCHAR(32)  NOT NULL DEFAULT 'NONE',
    handle_remark     VARCHAR(500),
    cost_ms           INT,
    log_time          TIMESTAMP,
    org_id            BIGINT,
    org_name          VARCHAR(128),
    remark            VARCHAR(255),
    created_by        BIGINT,
    created_at        TIMESTAMP,
    updated_by        BIGINT,
    updated_at        TIMESTAMP,
    deleted           INT          NOT NULL DEFAULT 0,
    version           INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE INDEX idx_oa_sys_log_type ON oa_sys_log (log_type);
CREATE INDEX idx_oa_sys_log_time ON oa_sys_log (log_time);
CREATE INDEX idx_oa_sys_log_level ON oa_sys_log (log_level);

CREATE TABLE oa_mobile_session (
    id                BIGINT       NOT NULL,
    session_no        VARCHAR(64)  NOT NULL,
    user_id           BIGINT       NOT NULL,
    user_name         VARCHAR(64),
    device_id         VARCHAR(128),
    device_model      VARCHAR(128),
    os_version        VARCHAR(64),
    app_version       VARCHAR(32),
    client_type       VARCHAR(32)  NOT NULL DEFAULT 'APP',
    login_ip          VARCHAR(64),
    push_token        VARCHAR(255),
    login_time        TIMESTAMP,
    last_active_time  TIMESTAMP,
    expire_time       TIMESTAMP,
    session_status    VARCHAR(32)  NOT NULL DEFAULT 'ACTIVE',
    revoke_reason     VARCHAR(255),
    org_id            BIGINT,
    org_name          VARCHAR(128),
    remark            VARCHAR(255),
    created_by        BIGINT,
    created_at        TIMESTAMP,
    updated_by        BIGINT,
    updated_at        TIMESTAMP,
    deleted           INT          NOT NULL DEFAULT 0,
    version           INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_oa_mobile_session_no ON oa_mobile_session (session_no);
CREATE INDEX idx_oa_mobile_session_user ON oa_mobile_session (user_id);
CREATE INDEX idx_oa_mobile_session_status ON oa_mobile_session (session_status);
