-- G8-N11 六系统集成—EDI 网关（WBS T072）表结构。
-- 覆盖范围：客户/供应商 EDI 报文映射、签名校验、回执、重传、对账与异常人工处理。
-- 交付物：接口规范、映射表、联调报告（同步批次）、异常补偿和对账报告。
-- 主数据权责：EDI 网关为报文收发与签名校验权威源，各业务系统为交易单据权威源；
-- 入站报文按签名校验通过后落库并转业务系统，校验失败或重传超限进入异常补偿人工处理。

-- ========== 1. 集成接口定义 ==========

CREATE TABLE intg_edi_gateway_interface (
    id                  BIGINT        NOT NULL,
    interface_no        VARCHAR(64)   NOT NULL,
    interface_name      VARCHAR(200),
    direction           VARCHAR(32)   NOT NULL DEFAULT 'EDI_INBOUND',
    object_type         VARCHAR(32)   NOT NULL DEFAULT 'EDI_PURCHASE_ORDER',
    protocol            VARCHAR(32)   NOT NULL DEFAULT 'API',
    endpoint            VARCHAR(255),
    trigger_type        VARCHAR(32)   NOT NULL DEFAULT 'MANUAL',
    sync_mode           VARCHAR(32)   NOT NULL DEFAULT 'INCREMENTAL',
    interface_status    VARCHAR(32)   NOT NULL DEFAULT 'DRAFT',
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
CREATE UNIQUE INDEX uk_intg_edi_gateway_interface_no ON intg_edi_gateway_interface (interface_no);
CREATE INDEX idx_intg_edi_gateway_interface_object ON intg_edi_gateway_interface (object_type);
CREATE INDEX idx_intg_edi_gateway_interface_protocol ON intg_edi_gateway_interface (protocol);
CREATE INDEX idx_intg_edi_gateway_interface_status ON intg_edi_gateway_interface (interface_status);

-- ========== 2. 字段映射 ==========

CREATE TABLE intg_edi_gateway_mapping (
    id                  BIGINT        NOT NULL,
    mapping_no          VARCHAR(64)   NOT NULL,
    mapping_name        VARCHAR(200),
    interface_no        VARCHAR(64),
    object_type         VARCHAR(32)   NOT NULL DEFAULT 'EDI_PURCHASE_ORDER',
    source_field        VARCHAR(128),
    target_field        VARCHAR(128),
    transform_rule      VARCHAR(500),
    default_value       VARCHAR(255),
    required_flag       INT           NOT NULL DEFAULT 0,
    mapping_status      VARCHAR(32)   NOT NULL DEFAULT 'DRAFT',
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
CREATE UNIQUE INDEX uk_intg_edi_gateway_mapping_no ON intg_edi_gateway_mapping (mapping_no);
CREATE INDEX idx_intg_edi_gateway_mapping_interface ON intg_edi_gateway_mapping (interface_no);
CREATE INDEX idx_intg_edi_gateway_mapping_object ON intg_edi_gateway_mapping (object_type);
CREATE INDEX idx_intg_edi_gateway_mapping_status ON intg_edi_gateway_mapping (mapping_status);

-- ========== 3. 同步批次 ==========

CREATE TABLE intg_edi_gateway_batch (
    id                  BIGINT        NOT NULL,
    batch_no            VARCHAR(64)   NOT NULL,
    batch_name          VARCHAR(200),
    interface_no        VARCHAR(64),
    direction           VARCHAR(32)   NOT NULL DEFAULT 'EDI_INBOUND',
    object_type         VARCHAR(32)   NOT NULL DEFAULT 'EDI_PURCHASE_ORDER',
    trigger_type        VARCHAR(32)   NOT NULL DEFAULT 'MANUAL',
    total_count         INT           NOT NULL DEFAULT 0,
    success_count       INT           NOT NULL DEFAULT 0,
    fail_count          INT           NOT NULL DEFAULT 0,
    start_time          TIMESTAMP,
    end_time            TIMESTAMP,
    batch_status        VARCHAR(32)   NOT NULL DEFAULT 'PENDING',
    message             VARCHAR(1000),
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
CREATE UNIQUE INDEX uk_intg_edi_gateway_batch_no ON intg_edi_gateway_batch (batch_no);
CREATE INDEX idx_intg_edi_gateway_batch_interface ON intg_edi_gateway_batch (interface_no);
CREATE INDEX idx_intg_edi_gateway_batch_object ON intg_edi_gateway_batch (object_type);
CREATE INDEX idx_intg_edi_gateway_batch_status ON intg_edi_gateway_batch (batch_status);

-- ========== 4. 内部系统接收回执 ==========

CREATE TABLE intg_edi_gateway_receipt (
    id                  BIGINT        NOT NULL,
    receipt_no          VARCHAR(64)   NOT NULL,
    batch_no            VARCHAR(64),
    interface_no        VARCHAR(64),
    object_type         VARCHAR(32)   NOT NULL DEFAULT 'EDI_PURCHASE_ORDER',
    object_no           VARCHAR(128),
    object_version      VARCHAR(64),
    target_object_id    VARCHAR(128),
    receipt_status      VARCHAR(32)   NOT NULL DEFAULT 'PENDING',
    check_message       VARCHAR(1000),
    receipt_time        TIMESTAMP,
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
CREATE UNIQUE INDEX uk_intg_edi_gateway_receipt_no ON intg_edi_gateway_receipt (receipt_no);
CREATE INDEX idx_intg_edi_gateway_receipt_batch ON intg_edi_gateway_receipt (batch_no);
CREATE INDEX idx_intg_edi_gateway_receipt_interface ON intg_edi_gateway_receipt (interface_no);
CREATE INDEX idx_intg_edi_gateway_receipt_status ON intg_edi_gateway_receipt (receipt_status);

-- ========== 5. 异常补偿 ==========

CREATE TABLE intg_edi_gateway_compensation (
    id                  BIGINT        NOT NULL,
    compensation_no     VARCHAR(64)   NOT NULL,
    batch_no            VARCHAR(64),
    interface_no        VARCHAR(64),
    object_type         VARCHAR(32)   NOT NULL DEFAULT 'EDI_PURCHASE_ORDER',
    object_no           VARCHAR(128),
    error_type          VARCHAR(32)   NOT NULL DEFAULT 'VALIDATION',
    error_message       VARCHAR(1000),
    retry_count         INT           NOT NULL DEFAULT 0,
    handler             VARCHAR(64),
    handle_time         TIMESTAMP,
    compensation_status VARCHAR(32)   NOT NULL DEFAULT 'PENDING',
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
CREATE UNIQUE INDEX uk_intg_edi_gateway_compensation_no ON intg_edi_gateway_compensation (compensation_no);
CREATE INDEX idx_intg_edi_gateway_compensation_batch ON intg_edi_gateway_compensation (batch_no);
CREATE INDEX idx_intg_edi_gateway_compensation_interface ON intg_edi_gateway_compensation (interface_no);
CREATE INDEX idx_intg_edi_gateway_compensation_status ON intg_edi_gateway_compensation (compensation_status);

-- ========== 6. 对账 ==========

CREATE TABLE intg_edi_gateway_reconcile (
    id                  BIGINT        NOT NULL,
    reconcile_no        VARCHAR(64)   NOT NULL,
    reconcile_name      VARCHAR(200),
    interface_no        VARCHAR(64),
    object_type         VARCHAR(32)   NOT NULL DEFAULT 'EDI_PURCHASE_ORDER',
    source_count        INT           NOT NULL DEFAULT 0,
    target_count        INT           NOT NULL DEFAULT 0,
    diff_count          INT           NOT NULL DEFAULT 0,
    reconcile_date      TIMESTAMP,
    reconcile_status    VARCHAR(32)   NOT NULL DEFAULT 'PENDING',
    result_message      VARCHAR(1000),
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
CREATE UNIQUE INDEX uk_intg_edi_gateway_reconcile_no ON intg_edi_gateway_reconcile (reconcile_no);
CREATE INDEX idx_intg_edi_gateway_reconcile_interface ON intg_edi_gateway_reconcile (interface_no);
CREATE INDEX idx_intg_edi_gateway_reconcile_object ON intg_edi_gateway_reconcile (object_type);
CREATE INDEX idx_intg_edi_gateway_reconcile_status ON intg_edi_gateway_reconcile (reconcile_status);
