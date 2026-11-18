-- G6-N8 MES—数据采集（WBS T044）表结构。
-- 主数据权责：MES 为测试设备/仪器、PLC/网关接口、采集数据点、校验规则与采集数据（含时间戳）的执行权威源；
-- 采集设备引用设备（G6-N4），采集数据点引用物料与工序，采集数据记录引用设备与数据点。
-- 覆盖范围：测试设备、仪器、PLC/网关接口、数据校验与时间戳。

-- ========== 1. 采集设备（测试设备/仪器） ==========

CREATE TABLE mes_collect_device (
    id                  BIGINT        NOT NULL,
    device_no           VARCHAR(64)   NOT NULL,
    device_code         VARCHAR(64),
    device_name         VARCHAR(200),
    device_type         VARCHAR(32)   NOT NULL DEFAULT 'TEST',
    model               VARCHAR(128),
    vendor              VARCHAR(128),
    protocol            VARCHAR(32),
    ip_address          VARCHAR(64),
    port                INT,
    gateway_code        VARCHAR(64),
    location            VARCHAR(128),
    device_status       VARCHAR(32)   NOT NULL DEFAULT 'OFFLINE',
    install_date        TIMESTAMP,
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
CREATE UNIQUE INDEX uk_mes_collect_device_no ON mes_collect_device (device_no);
CREATE INDEX idx_mes_collect_device_code ON mes_collect_device (device_code);
CREATE INDEX idx_mes_collect_device_type ON mes_collect_device (device_type);
CREATE INDEX idx_mes_collect_device_status ON mes_collect_device (device_status);
CREATE INDEX idx_mes_collect_device_gateway ON mes_collect_device (gateway_code);

-- ========== 2. PLC/网关接口 ==========

CREATE TABLE mes_collect_interface (
    id                  BIGINT        NOT NULL,
    interface_no        VARCHAR(64)   NOT NULL,
    interface_name      VARCHAR(200),
    device_no           VARCHAR(64),
    device_code         VARCHAR(64),
    protocol            VARCHAR(32),
    endpoint            VARCHAR(255),
    address             VARCHAR(255),
    data_format         VARCHAR(32),
    sample_interval     INT,
    interface_status    VARCHAR(32)   NOT NULL DEFAULT 'OFFLINE',
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
CREATE UNIQUE INDEX uk_mes_collect_interface_no ON mes_collect_interface (interface_no);
CREATE INDEX idx_mes_collect_interface_device ON mes_collect_interface (device_code);
CREATE INDEX idx_mes_collect_interface_protocol ON mes_collect_interface (protocol);
CREATE INDEX idx_mes_collect_interface_status ON mes_collect_interface (interface_status);

-- ========== 3. 采集数据点 ==========

CREATE TABLE mes_collect_point (
    id                  BIGINT        NOT NULL,
    point_no            VARCHAR(64)   NOT NULL,
    point_code          VARCHAR(64),
    point_name          VARCHAR(200),
    interface_no        VARCHAR(64),
    device_code         VARCHAR(64),
    address             VARCHAR(128),
    data_type           VARCHAR(32)   NOT NULL DEFAULT 'NUMERIC',
    uom                 VARCHAR(16),
    scale_factor        DECIMAL(18,4),
    upper_limit         DECIMAL(18,4),
    lower_limit         DECIMAL(18,4),
    point_status        VARCHAR(32)   NOT NULL DEFAULT 'OFFLINE',
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
CREATE UNIQUE INDEX uk_mes_collect_point_no ON mes_collect_point (point_no);
CREATE INDEX idx_mes_collect_point_code ON mes_collect_point (point_code);
CREATE INDEX idx_mes_collect_point_interface ON mes_collect_point (interface_no);
CREATE INDEX idx_mes_collect_point_device ON mes_collect_point (device_code);
CREATE INDEX idx_mes_collect_point_status ON mes_collect_point (point_status);

-- ========== 4. 数据校验规则 ==========

CREATE TABLE mes_collect_rule (
    id                  BIGINT        NOT NULL,
    rule_no             VARCHAR(64)   NOT NULL,
    rule_name           VARCHAR(200),
    point_code          VARCHAR(64),
    rule_type           VARCHAR(32)   NOT NULL DEFAULT 'RANGE',
    min_value           DECIMAL(18,4),
    max_value           DECIMAL(18,4),
    expression          VARCHAR(500),
    timestamp_tolerance INT,
    rule_action         VARCHAR(32)   NOT NULL DEFAULT 'WARN',
    rule_status         VARCHAR(32)   NOT NULL DEFAULT 'DRAFT',
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
CREATE UNIQUE INDEX uk_mes_collect_rule_no ON mes_collect_rule (rule_no);
CREATE INDEX idx_mes_collect_rule_point ON mes_collect_rule (point_code);
CREATE INDEX idx_mes_collect_rule_type ON mes_collect_rule (rule_type);
CREATE INDEX idx_mes_collect_rule_status ON mes_collect_rule (rule_status);

-- ========== 5. 采集数据记录（含时间戳与校验结果） ==========

CREATE TABLE mes_collect_record (
    id                  BIGINT        NOT NULL,
    record_no           VARCHAR(64)   NOT NULL,
    device_code         VARCHAR(64),
    interface_no        VARCHAR(64),
    point_code          VARCHAR(64),
    collect_value       VARCHAR(255),
    data_type           VARCHAR(32),
    uom                 VARCHAR(16),
    collect_time        TIMESTAMP,
    receive_time        TIMESTAMP,
    quality_flag        VARCHAR(32)   NOT NULL DEFAULT 'VALID',
    validate_status     VARCHAR(32)   NOT NULL DEFAULT 'PENDING',
    validate_message    VARCHAR(500),
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
CREATE UNIQUE INDEX uk_mes_collect_record_no ON mes_collect_record (record_no);
CREATE INDEX idx_mes_collect_record_device ON mes_collect_record (device_code);
CREATE INDEX idx_mes_collect_record_point ON mes_collect_record (point_code);
CREATE INDEX idx_mes_collect_record_collect_time ON mes_collect_record (collect_time);
CREATE INDEX idx_mes_collect_record_validate_status ON mes_collect_record (validate_status);
