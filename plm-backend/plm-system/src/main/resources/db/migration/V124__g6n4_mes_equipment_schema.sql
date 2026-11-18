-- G6-N4 MES—设备与工装（WBS T040）表结构。
-- 主数据权责：MES 为设备台账、设备状态、点检、保养、故障与工装寿命的执行权威源；
-- 设备引用产线/车间（G6-N1），工装寿命关联使用设备。
-- 覆盖范围：设备台账、状态、点检、保养、故障、工装寿命。

-- ========== 1. 设备台账 ==========

CREATE TABLE mes_equipment (
    id                  BIGINT        NOT NULL,
    equipment_no        VARCHAR(64)   NOT NULL,
    equipment_name      VARCHAR(200),
    equipment_type      VARCHAR(64),
    model               VARCHAR(128),
    spec                VARCHAR(200),
    manufacturer        VARCHAR(200),
    workshop_code       VARCHAR(64),
    line_code           VARCHAR(64),
    location            VARCHAR(200),
    purchase_date       TIMESTAMP,
    install_date        TIMESTAMP,
    warranty_end_date   TIMESTAMP,
    equipment_status    VARCHAR(32)   NOT NULL DEFAULT 'IDLE',
    manager             VARCHAR(64),
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
CREATE UNIQUE INDEX uk_mes_equipment_no ON mes_equipment (equipment_no);
CREATE INDEX idx_mes_equipment_type ON mes_equipment (equipment_type);
CREATE INDEX idx_mes_equipment_workshop ON mes_equipment (workshop_code);
CREATE INDEX idx_mes_equipment_line ON mes_equipment (line_code);
CREATE INDEX idx_mes_equipment_status ON mes_equipment (equipment_status);

-- ========== 2. 设备状态记录 ==========

CREATE TABLE mes_equipment_status (
    id                  BIGINT        NOT NULL,
    status_no           VARCHAR(64)   NOT NULL,
    equipment_code      VARCHAR(64),
    equipment_name      VARCHAR(200),
    status_type         VARCHAR(32)   NOT NULL DEFAULT 'RUNNING',
    start_time          TIMESTAMP,
    end_time            TIMESTAMP,
    duration_minutes    DECIMAL(18,4) NOT NULL DEFAULT 0,
    operator            VARCHAR(64),
    shift_code          VARCHAR(32),
    record_status       VARCHAR(32)   NOT NULL DEFAULT 'DRAFT',
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
CREATE UNIQUE INDEX uk_mes_equipment_status_no ON mes_equipment_status (status_no);
CREATE INDEX idx_mes_equipment_status_equipment ON mes_equipment_status (equipment_code);
CREATE INDEX idx_mes_equipment_status_type ON mes_equipment_status (status_type);
CREATE INDEX idx_mes_equipment_status_record ON mes_equipment_status (record_status);

-- ========== 3. 设备点检 ==========

CREATE TABLE mes_equipment_check (
    id                  BIGINT        NOT NULL,
    check_no            VARCHAR(64)   NOT NULL,
    equipment_code      VARCHAR(64),
    equipment_name      VARCHAR(200),
    check_type          VARCHAR(32)   NOT NULL DEFAULT 'DAILY',
    check_item          VARCHAR(500),
    check_result        VARCHAR(32)   NOT NULL DEFAULT 'PASS',
    check_status        VARCHAR(32)   NOT NULL DEFAULT 'PENDING',
    inspector           VARCHAR(64),
    check_time          TIMESTAMP,
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
CREATE UNIQUE INDEX uk_mes_equipment_check_no ON mes_equipment_check (check_no);
CREATE INDEX idx_mes_equipment_check_equipment ON mes_equipment_check (equipment_code);
CREATE INDEX idx_mes_equipment_check_type ON mes_equipment_check (check_type);
CREATE INDEX idx_mes_equipment_check_status ON mes_equipment_check (check_status);

-- ========== 4. 设备保养 ==========

CREATE TABLE mes_equipment_maintenance (
    id                  BIGINT        NOT NULL,
    maintenance_no      VARCHAR(64)   NOT NULL,
    equipment_code      VARCHAR(64),
    equipment_name      VARCHAR(200),
    maintenance_type    VARCHAR(32)   NOT NULL DEFAULT 'DAILY',
    plan_time           TIMESTAMP,
    actual_time         TIMESTAMP,
    maintainer          VARCHAR(64),
    cost                DECIMAL(18,4) NOT NULL DEFAULT 0,
    maintenance_status  VARCHAR(32)   NOT NULL DEFAULT 'DRAFT',
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
CREATE UNIQUE INDEX uk_mes_equipment_maintenance_no ON mes_equipment_maintenance (maintenance_no);
CREATE INDEX idx_mes_equipment_maintenance_equipment ON mes_equipment_maintenance (equipment_code);
CREATE INDEX idx_mes_equipment_maintenance_type ON mes_equipment_maintenance (maintenance_type);
CREATE INDEX idx_mes_equipment_maintenance_status ON mes_equipment_maintenance (maintenance_status);

-- ========== 5. 设备故障 ==========

CREATE TABLE mes_equipment_fault (
    id                  BIGINT        NOT NULL,
    fault_no            VARCHAR(64)   NOT NULL,
    equipment_code      VARCHAR(64),
    equipment_name      VARCHAR(200),
    fault_type          VARCHAR(64),
    fault_level         VARCHAR(32)   NOT NULL DEFAULT 'MEDIUM',
    fault_desc          VARCHAR(1000),
    occur_time          TIMESTAMP,
    reporter            VARCHAR(64),
    repairer            VARCHAR(64),
    repair_time         TIMESTAMP,
    downtime_minutes    DECIMAL(18,4) NOT NULL DEFAULT 0,
    fault_status        VARCHAR(32)   NOT NULL DEFAULT 'DRAFT',
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
CREATE UNIQUE INDEX uk_mes_equipment_fault_no ON mes_equipment_fault (fault_no);
CREATE INDEX idx_mes_equipment_fault_equipment ON mes_equipment_fault (equipment_code);
CREATE INDEX idx_mes_equipment_fault_level ON mes_equipment_fault (fault_level);
CREATE INDEX idx_mes_equipment_fault_status ON mes_equipment_fault (fault_status);

-- ========== 6. 工装寿命 ==========

CREATE TABLE mes_tool_life (
    id                  BIGINT        NOT NULL,
    tool_no             VARCHAR(64)   NOT NULL,
    tool_code           VARCHAR(64),
    tool_name           VARCHAR(200),
    tool_type           VARCHAR(64),
    equipment_code      VARCHAR(64),
    total_life          DECIMAL(18,4) NOT NULL DEFAULT 0,
    used_life           DECIMAL(18,4) NOT NULL DEFAULT 0,
    remaining_life      DECIMAL(18,4) NOT NULL DEFAULT 0,
    life_unit           VARCHAR(32),
    life_status         VARCHAR(32)   NOT NULL DEFAULT 'DRAFT',
    install_date        TIMESTAMP,
    scrapped_date       TIMESTAMP,
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
CREATE UNIQUE INDEX uk_mes_tool_life_no ON mes_tool_life (tool_no);
CREATE INDEX idx_mes_tool_life_code ON mes_tool_life (tool_code);
CREATE INDEX idx_mes_tool_life_equipment ON mes_tool_life (equipment_code);
CREATE INDEX idx_mes_tool_life_status ON mes_tool_life (life_status);
