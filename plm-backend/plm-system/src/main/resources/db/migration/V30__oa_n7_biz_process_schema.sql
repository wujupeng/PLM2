-- OA-N7 销售采购生产品质研发流程：销售生产、品质、采购、研发技术四个业务流程包
-- 说明：SQL 同时兼容 PostgreSQL 与 H2（PostgreSQL 兼容模式），主键由应用侧雪花算法生成。
-- 设计原则：
--   1) 审批路径统一由 OA-N3 低代码工作流引擎承载，业务单据通过 instance_id / instance_no 关联流程实例，
--      审批完成后由引擎事件驱动回写业务单据状态（见 WorkflowEngineService 发布的工作流事件）。
--   2) 权威数据边界遵循任务书要求，OA 不重复建设权威台账：
--      - 排产权威归属 MES（OA 仅承载生产顺序表的维护与发布协同，不覆盖 MES 已发布生产计划）；
--      - 采购订单/价格主数据权威归属 ERP（OA 承载审批与协同，不回写 ERP 单据）；
--      - 质量台账/检测数据权威归属 QMS，工程变更技术权威归属 PLM（OA 承载审批协同与关联）。
--      上述边界对应的同步开关均为可配置项（sys_config）并标记待业务方确认。
--   3) 单据编号前缀、评分权重与等级阈值、有效期上限、对账开关等规则均为可配置项。
-- 注意：业务字段一律不得命名为 version，避免与 BaseEntity 的乐观锁字段 version 冲突。

-- ========== 客户授信申请（OA-DEV-062） ==========

CREATE TABLE oa_biz_customer_credit (
    id                BIGINT       NOT NULL,
    credit_no         VARCHAR(64)  NOT NULL,
    customer_code     VARCHAR(64),
    customer_name     VARCHAR(200) NOT NULL,
    credit_type       VARCHAR(32)  NOT NULL DEFAULT 'NEW',
    apply_amount      DECIMAL(18,2),
    credit_limit      DECIMAL(18,2),
    currency          VARCHAR(8)   NOT NULL DEFAULT 'CNY',
    credit_days       INT,
    valid_from        DATE,
    valid_to          DATE,
    risk_level        VARCHAR(32),
    risk_opinion      VARCHAR(500),
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
CREATE UNIQUE INDEX uk_oa_biz_credit_no ON oa_biz_customer_credit (credit_no);
CREATE INDEX idx_oa_biz_credit_customer ON oa_biz_customer_credit (customer_code);
CREATE INDEX idx_oa_biz_credit_status ON oa_biz_customer_credit (flow_status);

-- ========== 价格审批（OA-DEV-063 销售价格 / OA-DEV-071 零件价格） ==========

CREATE TABLE oa_biz_price_approval (
    id                BIGINT       NOT NULL,
    price_no          VARCHAR(64)  NOT NULL,
    price_category    VARCHAR(32)  NOT NULL DEFAULT 'SALES',
    change_type       VARCHAR(32)  NOT NULL DEFAULT 'NEW',
    material_code     VARCHAR(64),
    material_name     VARCHAR(200),
    customer_code     VARCHAR(64),
    customer_name     VARCHAR(200),
    supplier_code     VARCHAR(64),
    supplier_name     VARCHAR(200),
    price_amount      DECIMAL(18,4) NOT NULL DEFAULT 0,
    old_price         DECIMAL(18,4),
    currency          VARCHAR(8)   NOT NULL DEFAULT 'CNY',
    price_unit        VARCHAR(16)  NOT NULL DEFAULT 'PCS',
    effective_from    DATE,
    effective_to      DATE,
    cost_basis        VARCHAR(1000),
    approval_opinion  VARCHAR(500),
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
CREATE UNIQUE INDEX uk_oa_biz_price_no ON oa_biz_price_approval (price_no);
CREATE INDEX idx_oa_biz_price_material ON oa_biz_price_approval (material_code);
CREATE INDEX idx_oa_biz_price_status ON oa_biz_price_approval (flow_status);

-- ========== 交期延误协调单（OA-DEV-064） ==========

CREATE TABLE oa_biz_delivery_coordination (
    id                BIGINT       NOT NULL,
    coord_no          VARCHAR(64)  NOT NULL,
    order_no          VARCHAR(64),
    customer_code     VARCHAR(64),
    customer_name     VARCHAR(200),
    material_code     VARCHAR(64),
    material_name     VARCHAR(200),
    demand_qty        DECIMAL(18,2),
    original_delivery DATE,
    promised_delivery DATE,
    delay_days        INT,
    delay_reason      VARCHAR(1000),
    capacity_note     VARCHAR(500),
    shortage_reason   VARCHAR(500),
    responsible_dept  VARCHAR(128),
    responsible_user_id BIGINT,
    responsible_name  VARCHAR(64),
    corrective_action VARCHAR(1000),
    close_status      VARCHAR(32)  NOT NULL DEFAULT 'OPEN',
    close_time        TIMESTAMP,
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
CREATE UNIQUE INDEX uk_oa_biz_coord_no ON oa_biz_delivery_coordination (coord_no);
CREATE INDEX idx_oa_biz_coord_order ON oa_biz_delivery_coordination (order_no);
CREATE INDEX idx_oa_biz_coord_status ON oa_biz_delivery_coordination (flow_status);

-- ========== 生产顺序表（OA-DEV-065，排产权威归属 MES 待确认） ==========

CREATE TABLE oa_biz_production_sequence (
    id                BIGINT       NOT NULL,
    sequence_no       VARCHAR(64)  NOT NULL,
    sequence_name     VARCHAR(200) NOT NULL,
    sequence_version  INT          NOT NULL DEFAULT 1,
    plan_period       VARCHAR(32),
    workshop          VARCHAR(128),
    plan_source       VARCHAR(32)  NOT NULL DEFAULT 'OA',
    seq_status        VARCHAR(32)  NOT NULL DEFAULT 'DRAFT',
    item_count        INT          NOT NULL DEFAULT 0,
    publish_time      TIMESTAMP,
    publisher_user_id BIGINT,
    publisher_name    VARCHAR(64),
    owner_user_id     BIGINT,
    owner_name        VARCHAR(64),
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
CREATE UNIQUE INDEX uk_oa_biz_seq_no ON oa_biz_production_sequence (sequence_no);
CREATE INDEX idx_oa_biz_seq_status ON oa_biz_production_sequence (seq_status);

CREATE TABLE oa_biz_production_sequence_item (
    id                BIGINT       NOT NULL,
    sequence_id       BIGINT       NOT NULL,
    line_no           INT          NOT NULL DEFAULT 1,
    order_no          VARCHAR(64),
    material_code     VARCHAR(64),
    material_name     VARCHAR(200),
    plan_qty          DECIMAL(18,2),
    plan_start        TIMESTAMP,
    plan_end          TIMESTAMP,
    workstation       VARCHAR(128),
    priority_no       INT,
    remark            VARCHAR(255),
    created_by        BIGINT,
    created_at        TIMESTAMP,
    updated_by        BIGINT,
    updated_at        TIMESTAMP,
    deleted           INT          NOT NULL DEFAULT 0,
    version           INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE INDEX idx_oa_biz_seq_item_seq ON oa_biz_production_sequence_item (sequence_id);

-- ========== 订货传票（OA-DEV-066 销售/进口件、OA-DEV-071 采购，ERP 单据仍由 ERP 生成） ==========

CREATE TABLE oa_biz_order_voucher (
    id                BIGINT       NOT NULL,
    voucher_no        VARCHAR(64)  NOT NULL,
    voucher_type      VARCHAR(32)  NOT NULL DEFAULT 'SALES',
    import_flag       INT          NOT NULL DEFAULT 0,
    order_no          VARCHAR(64),
    erp_order_no      VARCHAR(64),
    customer_code     VARCHAR(64),
    customer_name     VARCHAR(200),
    supplier_code     VARCHAR(64),
    supplier_name     VARCHAR(200),
    material_code     VARCHAR(64),
    material_name     VARCHAR(200),
    qty               DECIMAL(18,2),
    unit              VARCHAR(16)  NOT NULL DEFAULT 'PCS',
    delivery_date     DATE,
    currency          VARCHAR(8)   NOT NULL DEFAULT 'CNY',
    amount            DECIMAL(18,2),
    trade_terms       VARCHAR(500),
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
CREATE UNIQUE INDEX uk_oa_biz_voucher_no ON oa_biz_order_voucher (voucher_no);
CREATE INDEX idx_oa_biz_voucher_type ON oa_biz_order_voucher (voucher_type);
CREATE INDEX idx_oa_biz_voucher_status ON oa_biz_order_voucher (flow_status);

-- ========== 车间生产日报（OA-DEV-067，需与 MES 生产实绩对账并标注来源） ==========

CREATE TABLE oa_biz_workshop_daily (
    id                BIGINT       NOT NULL,
    report_no         VARCHAR(64)  NOT NULL,
    report_date       DATE         NOT NULL,
    workshop          VARCHAR(128),
    shift_code        VARCHAR(32),
    dept_id           BIGINT,
    dept_name         VARCHAR(128),
    plan_qty          DECIMAL(18,2),
    output_qty        DECIMAL(18,2),
    qualified_qty     DECIMAL(18,2),
    defect_qty        DECIMAL(18,2),
    complete_rate     DECIMAL(8,2),
    downtime_minutes  INT,
    abnormal_desc     VARCHAR(1000),
    data_source       VARCHAR(32)  NOT NULL DEFAULT 'MANUAL',
    reconcile_flag    INT          NOT NULL DEFAULT 0,
    reporter_user_id  BIGINT       NOT NULL,
    reporter_name     VARCHAR(64),
    org_id            BIGINT,
    org_name          VARCHAR(128),
    report_status     VARCHAR(32)  NOT NULL DEFAULT 'DRAFT',
    remark            VARCHAR(255),
    created_by        BIGINT,
    created_at        TIMESTAMP,
    updated_by        BIGINT,
    updated_at        TIMESTAMP,
    deleted           INT          NOT NULL DEFAULT 0,
    version           INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_oa_biz_daily_no ON oa_biz_workshop_daily (report_no);
CREATE INDEX idx_oa_biz_daily_date ON oa_biz_workshop_daily (report_date);
CREATE INDEX idx_oa_biz_daily_status ON oa_biz_workshop_daily (report_status);

-- ========== 供方考评（OA-DEV-068，月度/季度/年度） ==========

CREATE TABLE oa_biz_supplier_evaluation (
    id                BIGINT       NOT NULL,
    eval_no           VARCHAR(64)  NOT NULL,
    eval_period       VARCHAR(32)  NOT NULL DEFAULT 'MONTH',
    eval_year         INT          NOT NULL,
    eval_quarter      INT,
    eval_month        INT,
    supplier_code     VARCHAR(64),
    supplier_name     VARCHAR(200) NOT NULL,
    eval_item_count   INT          NOT NULL DEFAULT 0,
    total_score       DECIMAL(8,2),
    grade             VARCHAR(16),
    eval_basis        VARCHAR(1000),
    eval_opinion      VARCHAR(500),
    evaluator_user_id BIGINT       NOT NULL,
    evaluator_name    VARCHAR(64),
    org_id            BIGINT,
    org_name          VARCHAR(128),
    attachment_json   TEXT,
    eval_status       VARCHAR(32)  NOT NULL DEFAULT 'DRAFT',
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
CREATE UNIQUE INDEX uk_oa_biz_eval_no ON oa_biz_supplier_evaluation (eval_no);
CREATE INDEX idx_oa_biz_eval_supplier ON oa_biz_supplier_evaluation (supplier_code);
CREATE INDEX idx_oa_biz_eval_status ON oa_biz_supplier_evaluation (flow_status);

CREATE TABLE oa_biz_supplier_eval_item (
    id                BIGINT       NOT NULL,
    evaluation_id     BIGINT       NOT NULL,
    item_code         VARCHAR(64),
    item_name         VARCHAR(200) NOT NULL,
    weight            DECIMAL(8,2) NOT NULL DEFAULT 0,
    max_score         DECIMAL(8,2) NOT NULL DEFAULT 100,
    score             DECIMAL(8,2),
    score_basis       VARCHAR(500),
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
CREATE INDEX idx_oa_biz_eval_item_eval ON oa_biz_supplier_eval_item (evaluation_id);

-- ========== 质量报表与指标（OA-DEV-069，权威台账在 QMS） ==========

CREATE TABLE oa_biz_quality_metric (
    id                BIGINT       NOT NULL,
    metric_no         VARCHAR(64)  NOT NULL,
    metric_type       VARCHAR(32)  NOT NULL DEFAULT 'TARGET',
    metric_code       VARCHAR(64),
    metric_name       VARCHAR(200) NOT NULL,
    metric_period     VARCHAR(32),
    dept_id           BIGINT,
    dept_name         VARCHAR(128),
    target_value      DECIMAL(18,4),
    actual_value      DECIMAL(18,4),
    unit              VARCHAR(16),
    achieve_rate      DECIMAL(8,2),
    calc_formula      VARCHAR(500),
    data_source       VARCHAR(32)  NOT NULL DEFAULT 'MANUAL',
    source_ref        VARCHAR(255),
    refresh_time      TIMESTAMP,
    owner_user_id     BIGINT,
    owner_name        VARCHAR(64),
    org_id            BIGINT,
    org_name          VARCHAR(128),
    metric_status     VARCHAR(32)  NOT NULL DEFAULT 'DRAFT',
    remark            VARCHAR(500),
    created_by        BIGINT,
    created_at        TIMESTAMP,
    updated_by        BIGINT,
    updated_at        TIMESTAMP,
    deleted           INT          NOT NULL DEFAULT 0,
    version           INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_oa_biz_metric_no ON oa_biz_quality_metric (metric_no);
CREATE INDEX idx_oa_biz_metric_type ON oa_biz_quality_metric (metric_type);

-- ========== 检测委托单（OA-DEV-070，与 QMS/实验室系统边界待确认） ==========

CREATE TABLE oa_biz_inspection_request (
    id                BIGINT       NOT NULL,
    request_no        VARCHAR(64)  NOT NULL,
    request_dept_id   BIGINT,
    request_dept_name VARCHAR(128),
    requester_user_id BIGINT       NOT NULL,
    requester_name    VARCHAR(64),
    material_code     VARCHAR(64),
    material_name     VARCHAR(200),
    batch_no          VARCHAR(64),
    sample_qty        DECIMAL(18,2),
    inspection_items  VARCHAR(1000),
    require_date      DATE,
    lab_name          VARCHAR(128),
    result_status     VARCHAR(32)  NOT NULL DEFAULT 'PENDING',
    result_desc       VARCHAR(1000),
    report_attachment_json TEXT,
    qms_ref_no        VARCHAR(64),
    org_id            BIGINT,
    org_name          VARCHAR(128),
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
CREATE UNIQUE INDEX uk_oa_biz_inspect_no ON oa_biz_inspection_request (request_no);
CREATE INDEX idx_oa_biz_inspect_batch ON oa_biz_inspection_request (batch_no);
CREATE INDEX idx_oa_biz_inspect_status ON oa_biz_inspection_request (flow_status);

-- ========== 5M 变更追踪（OA-DEV-072） ==========

CREATE TABLE oa_biz_five_m_change (
    id                BIGINT       NOT NULL,
    change_no         VARCHAR(64)  NOT NULL,
    change_category   VARCHAR(32)  NOT NULL,
    change_title      VARCHAR(200) NOT NULL,
    product_code      VARCHAR(64),
    product_name      VARCHAR(200),
    part_code         VARCHAR(64),
    change_desc       VARCHAR(2000),
    risk_analysis     VARCHAR(1000),
    risk_level        VARCHAR(32),
    verification_plan VARCHAR(1000),
    verification_result VARCHAR(1000),
    effective_date    DATE,
    close_condition   VARCHAR(500),
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
CREATE UNIQUE INDEX uk_oa_biz_5m_no ON oa_biz_five_m_change (change_no);
CREATE INDEX idx_oa_biz_5m_category ON oa_biz_five_m_change (change_category);
CREATE INDEX idx_oa_biz_5m_status ON oa_biz_five_m_change (flow_status);

-- ========== 样品试制问题改善（OA-DEV-073，关联 PLM 产品/BOM/文档） ==========

CREATE TABLE oa_biz_sample_issue (
    id                BIGINT       NOT NULL,
    issue_no          VARCHAR(64)  NOT NULL,
    project_code      VARCHAR(64),
    project_name      VARCHAR(200),
    product_code      VARCHAR(64),
    bom_code          VARCHAR(64),
    part_code         VARCHAR(64),
    part_name         VARCHAR(200),
    issue_type        VARCHAR(64),
    issue_desc        VARCHAR(2000),
    severity          VARCHAR(16),
    responsible_user_id BIGINT,
    responsible_name  VARCHAR(64),
    due_date          DATE,
    measure           VARCHAR(1000),
    verify_result     VARCHAR(1000),
    issue_status      VARCHAR(32)  NOT NULL DEFAULT 'OPEN',
    plm_ref_no        VARCHAR(64),
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
CREATE UNIQUE INDEX uk_oa_biz_sample_no ON oa_biz_sample_issue (issue_no);
CREATE INDEX idx_oa_biz_sample_part ON oa_biz_sample_issue (part_code);
CREATE INDEX idx_oa_biz_sample_status ON oa_biz_sample_issue (issue_status);

-- ========== 内部审核实施计划（OA-DEV-074） ==========

CREATE TABLE oa_biz_internal_audit (
    id                BIGINT       NOT NULL,
    audit_no          VARCHAR(64)  NOT NULL,
    audit_plan_name   VARCHAR(200) NOT NULL,
    audit_scope       VARCHAR(500),
    audit_standard    VARCHAR(255),
    plan_start        DATE,
    plan_end          DATE,
    auditor_user_ids  VARCHAR(255),
    auditor_names     VARCHAR(255),
    audited_dept_id   BIGINT,
    audited_dept_name VARCHAR(128),
    audit_status      VARCHAR(32)  NOT NULL DEFAULT 'PLANNED',
    issue_count       INT          NOT NULL DEFAULT 0,
    audit_conclusion  VARCHAR(1000),
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
CREATE UNIQUE INDEX uk_oa_biz_audit_no ON oa_biz_internal_audit (audit_no);
CREATE INDEX idx_oa_biz_audit_status ON oa_biz_internal_audit (audit_status);

CREATE TABLE oa_biz_internal_audit_issue (
    id                BIGINT       NOT NULL,
    audit_id          BIGINT       NOT NULL,
    issue_no          VARCHAR(64),
    issue_desc        VARCHAR(1000) NOT NULL,
    issue_level       VARCHAR(16),
    responsible_user_id BIGINT,
    responsible_name  VARCHAR(64),
    due_date          DATE,
    correct_action    VARCHAR(1000),
    verify_result     VARCHAR(500),
    issue_status      VARCHAR(32)  NOT NULL DEFAULT 'OPEN',
    close_time        TIMESTAMP,
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
CREATE INDEX idx_oa_biz_audit_issue_audit ON oa_biz_internal_audit_issue (audit_id);

-- ========== 设计工程变更风险评审 ECR（OA-DEV-075，PLM 为技术变更权威记录） ==========

CREATE TABLE oa_biz_ecr_risk_review (
    id                BIGINT       NOT NULL,
    ecr_no            VARCHAR(64)  NOT NULL,
    ecr_title         VARCHAR(200) NOT NULL,
    change_type       VARCHAR(32)  NOT NULL DEFAULT 'ECR',
    product_code      VARCHAR(64),
    product_name      VARCHAR(200),
    material_code     VARCHAR(64),
    material_name     VARCHAR(200),
    change_reason     VARCHAR(1000),
    risk_desc         VARCHAR(1000),
    impact_analysis   VARCHAR(1000),
    countermeasure    VARCHAR(1000),
    review_conclusion VARCHAR(1000),
    plm_change_no     VARCHAR(64),
    plm_change_status VARCHAR(32),
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
CREATE UNIQUE INDEX uk_oa_biz_ecr_no ON oa_biz_ecr_risk_review (ecr_no);
CREATE INDEX idx_oa_biz_ecr_material ON oa_biz_ecr_risk_review (material_code);
CREATE INDEX idx_oa_biz_ecr_status ON oa_biz_ecr_risk_review (flow_status);

-- ========== 变更通知与图纸补发（OA-DEV-076） ==========

CREATE TABLE oa_biz_change_notice (
    id                BIGINT       NOT NULL,
    notice_no         VARCHAR(64)  NOT NULL,
    notice_type       VARCHAR(32)  NOT NULL DEFAULT 'NOTICE',
    change_source     VARCHAR(32)  NOT NULL DEFAULT 'OA',
    source_ref_no     VARCHAR(64),
    material_code     VARCHAR(64),
    material_name     VARCHAR(200),
    doc_code          VARCHAR(64),
    doc_name          VARCHAR(200),
    doc_version       VARCHAR(32),
    notice_title      VARCHAR(200) NOT NULL,
    notice_content    VARCHAR(2000),
    effective_date    DATE,
    receiver_user_ids VARCHAR(500),
    receiver_names    VARCHAR(500),
    receipt_count     INT          NOT NULL DEFAULT 0,
    need_receipt      INT          NOT NULL DEFAULT 1,
    publisher_user_id BIGINT       NOT NULL,
    publisher_name    VARCHAR(64),
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
CREATE UNIQUE INDEX uk_oa_biz_notice_no ON oa_biz_change_notice (notice_no);
CREATE INDEX idx_oa_biz_notice_type ON oa_biz_change_notice (notice_type);
CREATE INDEX idx_oa_biz_notice_status ON oa_biz_change_notice (flow_status);

CREATE TABLE oa_biz_change_notice_receipt (
    id                BIGINT       NOT NULL,
    notice_id         BIGINT       NOT NULL,
    receiver_user_id  BIGINT       NOT NULL,
    receiver_name     VARCHAR(64),
    receipt_status    VARCHAR(32)  NOT NULL DEFAULT 'PENDING',
    receipt_time      TIMESTAMP,
    receipt_remark    VARCHAR(255),
    created_by        BIGINT,
    created_at        TIMESTAMP,
    updated_by        BIGINT,
    updated_at        TIMESTAMP,
    deleted           INT          NOT NULL DEFAULT 0,
    version           INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE INDEX idx_oa_biz_notice_rcpt_notice ON oa_biz_change_notice_receipt (notice_id);
CREATE INDEX idx_oa_biz_notice_rcpt_user ON oa_biz_change_notice_receipt (receiver_user_id);

-- ========== 新开模检查与零件试流（OA-DEV-077，关联 PLM 物料与质量问题） ==========

CREATE TABLE oa_biz_mold_trial (
    id                BIGINT       NOT NULL,
    trial_no          VARCHAR(64)  NOT NULL,
    trial_type        VARCHAR(32)  NOT NULL DEFAULT 'MOLD_CHECK',
    mold_code         VARCHAR(64),
    mold_name         VARCHAR(200),
    part_code         VARCHAR(64),
    part_name         VARCHAR(200),
    material_code     VARCHAR(64),
    material_name     VARCHAR(200),
    supplier_code     VARCHAR(64),
    supplier_name     VARCHAR(200),
    check_items       VARCHAR(1000),
    check_result      VARCHAR(1000),
    trial_qty         DECIMAL(18,2),
    trial_result      VARCHAR(1000),
    trial_issue       VARCHAR(1000),
    verify_conclusion VARCHAR(1000),
    plm_ref_no        VARCHAR(64),
    trial_date        DATE,
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
CREATE UNIQUE INDEX uk_oa_biz_trial_no ON oa_biz_mold_trial (trial_no);
CREATE INDEX idx_oa_biz_trial_part ON oa_biz_mold_trial (part_code);
CREATE INDEX idx_oa_biz_trial_status ON oa_biz_mold_trial (flow_status);
