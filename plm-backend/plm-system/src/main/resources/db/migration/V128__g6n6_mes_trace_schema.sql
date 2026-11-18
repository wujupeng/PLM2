-- G6-N6 MES—产品追溯（WBS T042）表结构。
-- 主数据权责：MES 为序列号、批次、追溯码（Data Matrix）与追溯关联的执行权威源；
-- 序列号/批次引用物料主数据（PLM/G3），追溯关联记录人员、设备、工艺、物料及参数，
-- 追溯记录汇总一次追溯快照。
-- 覆盖范围：序列号台账、批次追溯、追溯码、追溯关联、追溯记录。

-- ========== 1. 序列号台账 ==========

CREATE TABLE mes_serial_number (
    id                  BIGINT        NOT NULL,
    serial_no           VARCHAR(64)   NOT NULL,
    material_code       VARCHAR(64),
    material_name       VARCHAR(200),
    batch_no            VARCHAR(64),
    serial_status       VARCHAR(32)   NOT NULL DEFAULT 'CREATED',
    work_order_no       VARCHAR(64),
    produce_time        TIMESTAMP,
    ship_time           TIMESTAMP,
    customer_code       VARCHAR(64),
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
CREATE UNIQUE INDEX uk_mes_serial_number_no ON mes_serial_number (serial_no);
CREATE INDEX idx_mes_serial_number_material ON mes_serial_number (material_code);
CREATE INDEX idx_mes_serial_number_batch ON mes_serial_number (batch_no);
CREATE INDEX idx_mes_serial_number_status ON mes_serial_number (serial_status);

-- ========== 2. 批次追溯 ==========

CREATE TABLE mes_batch_trace (
    id                  BIGINT        NOT NULL,
    batch_no            VARCHAR(64)   NOT NULL,
    material_code       VARCHAR(64),
    material_name       VARCHAR(200),
    batch_status        VARCHAR(32)   NOT NULL DEFAULT 'PENDING',
    work_order_no       VARCHAR(64),
    quantity            DECIMAL(18,4) NOT NULL DEFAULT 0,
    unit                VARCHAR(16),
    produce_time        TIMESTAMP,
    expire_time         TIMESTAMP,
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
CREATE UNIQUE INDEX uk_mes_batch_trace_no ON mes_batch_trace (batch_no);
CREATE INDEX idx_mes_batch_trace_material ON mes_batch_trace (material_code);
CREATE INDEX idx_mes_batch_trace_status ON mes_batch_trace (batch_status);
CREATE INDEX idx_mes_batch_trace_produce ON mes_batch_trace (produce_time);

-- ========== 3. 追溯码（Data Matrix） ==========

CREATE TABLE mes_trace_code (
    id                  BIGINT        NOT NULL,
    code_no             VARCHAR(64)   NOT NULL,
    code_type           VARCHAR(32)   NOT NULL DEFAULT 'DATAMATRIX',
    code_status         VARCHAR(32)   NOT NULL DEFAULT 'INACTIVE',
    code_content        VARCHAR(512),
    object_type         VARCHAR(32)   NOT NULL DEFAULT 'SERIAL',
    object_code         VARCHAR(64),
    print_time          TIMESTAMP,
    print_count         INT           NOT NULL DEFAULT 0,
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
CREATE UNIQUE INDEX uk_mes_trace_code_no ON mes_trace_code (code_no);
CREATE INDEX idx_mes_trace_code_object ON mes_trace_code (object_code);
CREATE INDEX idx_mes_trace_code_type ON mes_trace_code (code_type);
CREATE INDEX idx_mes_trace_code_status ON mes_trace_code (code_status);

-- ========== 4. 追溯关联 ==========

CREATE TABLE mes_trace_link (
    id                  BIGINT        NOT NULL,
    link_no             VARCHAR(64)   NOT NULL,
    object_type         VARCHAR(32)   NOT NULL DEFAULT 'SERIAL',
    object_code         VARCHAR(64),
    link_type           VARCHAR(32)   NOT NULL DEFAULT 'PERSON',
    link_code           VARCHAR(64),
    link_name           VARCHAR(200),
    link_value          VARCHAR(500),
    link_time           TIMESTAMP,
    operator            VARCHAR(64),
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
CREATE UNIQUE INDEX uk_mes_trace_link_no ON mes_trace_link (link_no);
CREATE INDEX idx_mes_trace_link_object ON mes_trace_link (object_code);
CREATE INDEX idx_mes_trace_link_type ON mes_trace_link (link_type);
CREATE INDEX idx_mes_trace_link_code ON mes_trace_link (link_code);

-- ========== 5. 追溯记录 ==========

CREATE TABLE mes_trace_record (
    id                  BIGINT        NOT NULL,
    record_no           VARCHAR(64)   NOT NULL,
    object_type         VARCHAR(32)   NOT NULL DEFAULT 'SERIAL',
    object_code         VARCHAR(64),
    record_status       VARCHAR(32)   NOT NULL DEFAULT 'DRAFT',
    trace_path          VARCHAR(2000),
    node_count          INT           NOT NULL DEFAULT 0,
    record_time         TIMESTAMP,
    recorder            VARCHAR(64),
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
CREATE UNIQUE INDEX uk_mes_trace_record_no ON mes_trace_record (record_no);
CREATE INDEX idx_mes_trace_record_object ON mes_trace_record (object_code);
CREATE INDEX idx_mes_trace_record_status ON mes_trace_record (record_status);
CREATE INDEX idx_mes_trace_record_time ON mes_trace_record (record_time);
