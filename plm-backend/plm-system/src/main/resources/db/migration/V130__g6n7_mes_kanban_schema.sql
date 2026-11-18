-- G6-N7 MES—生产看板（WBS T043）表结构。
-- 主数据权责：MES 为计划达成、产量、良率、停机、在制品与异常安灯看板指标的执行权威源；
-- 计划达成/产量/良率/在制品引用物料与工单，停机引用设备（G6-N4），安灯引用产线与工位。
-- 覆盖范围：计划达成、产量看板、良率看板、停机看板、在制品看板、异常安灯。

-- ========== 1. 计划达成 ==========

CREATE TABLE mes_kanban_plan (
    id                  BIGINT        NOT NULL,
    plan_no             VARCHAR(64)   NOT NULL,
    work_order_no       VARCHAR(64),
    material_code       VARCHAR(64),
    material_name       VARCHAR(200),
    plan_qty            DECIMAL(18,4) NOT NULL DEFAULT 0,
    finish_qty          DECIMAL(18,4) NOT NULL DEFAULT 0,
    achieve_rate        DECIMAL(9,4)  NOT NULL DEFAULT 0,
    plan_date           TIMESTAMP,
    line_code           VARCHAR(64),
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
CREATE UNIQUE INDEX uk_mes_kanban_plan_no ON mes_kanban_plan (plan_no);
CREATE INDEX idx_mes_kanban_plan_material ON mes_kanban_plan (material_code);
CREATE INDEX idx_mes_kanban_plan_line ON mes_kanban_plan (line_code);
CREATE INDEX idx_mes_kanban_plan_date ON mes_kanban_plan (plan_date);
CREATE INDEX idx_mes_kanban_plan_status ON mes_kanban_plan (record_status);

-- ========== 2. 产量看板 ==========

CREATE TABLE mes_kanban_output (
    id                  BIGINT        NOT NULL,
    output_no           VARCHAR(64)   NOT NULL,
    material_code       VARCHAR(64),
    material_name       VARCHAR(200),
    line_code           VARCHAR(64),
    shift_code          VARCHAR(32),
    output_qty          DECIMAL(18,4) NOT NULL DEFAULT 0,
    qualified_qty       DECIMAL(18,4) NOT NULL DEFAULT 0,
    unqualified_qty     DECIMAL(18,4) NOT NULL DEFAULT 0,
    uom                 VARCHAR(16),
    output_date         TIMESTAMP,
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
CREATE UNIQUE INDEX uk_mes_kanban_output_no ON mes_kanban_output (output_no);
CREATE INDEX idx_mes_kanban_output_material ON mes_kanban_output (material_code);
CREATE INDEX idx_mes_kanban_output_line ON mes_kanban_output (line_code);
CREATE INDEX idx_mes_kanban_output_date ON mes_kanban_output (output_date);
CREATE INDEX idx_mes_kanban_output_status ON mes_kanban_output (record_status);

-- ========== 3. 良率看板 ==========

CREATE TABLE mes_kanban_yield (
    id                  BIGINT        NOT NULL,
    yield_no            VARCHAR(64)   NOT NULL,
    material_code       VARCHAR(64),
    material_name       VARCHAR(200),
    line_code           VARCHAR(64),
    shift_code          VARCHAR(32),
    input_qty           DECIMAL(18,4) NOT NULL DEFAULT 0,
    qualified_qty       DECIMAL(18,4) NOT NULL DEFAULT 0,
    unqualified_qty     DECIMAL(18,4) NOT NULL DEFAULT 0,
    yield_rate          DECIMAL(9,4)  NOT NULL DEFAULT 0,
    stat_date           TIMESTAMP,
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
CREATE UNIQUE INDEX uk_mes_kanban_yield_no ON mes_kanban_yield (yield_no);
CREATE INDEX idx_mes_kanban_yield_material ON mes_kanban_yield (material_code);
CREATE INDEX idx_mes_kanban_yield_line ON mes_kanban_yield (line_code);
CREATE INDEX idx_mes_kanban_yield_date ON mes_kanban_yield (stat_date);
CREATE INDEX idx_mes_kanban_yield_status ON mes_kanban_yield (record_status);

-- ========== 4. 停机看板 ==========

CREATE TABLE mes_kanban_downtime (
    id                  BIGINT        NOT NULL,
    downtime_no         VARCHAR(64)   NOT NULL,
    equipment_code      VARCHAR(64),
    equipment_name      VARCHAR(200),
    line_code           VARCHAR(64),
    downtime_type       VARCHAR(32)   NOT NULL DEFAULT 'EQUIPMENT',
    start_time          TIMESTAMP,
    end_time            TIMESTAMP,
    duration_minutes    DECIMAL(18,4) NOT NULL DEFAULT 0,
    reason              VARCHAR(255),
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
CREATE UNIQUE INDEX uk_mes_kanban_downtime_no ON mes_kanban_downtime (downtime_no);
CREATE INDEX idx_mes_kanban_downtime_equipment ON mes_kanban_downtime (equipment_code);
CREATE INDEX idx_mes_kanban_downtime_line ON mes_kanban_downtime (line_code);
CREATE INDEX idx_mes_kanban_downtime_type ON mes_kanban_downtime (downtime_type);
CREATE INDEX idx_mes_kanban_downtime_start ON mes_kanban_downtime (start_time);

-- ========== 5. 在制品看板 ==========

CREATE TABLE mes_kanban_wip (
    id                  BIGINT        NOT NULL,
    wip_no              VARCHAR(64)   NOT NULL,
    work_order_no       VARCHAR(64),
    material_code       VARCHAR(64),
    material_name       VARCHAR(200),
    line_code           VARCHAR(64),
    process_code        VARCHAR(64),
    wip_qty             DECIMAL(18,4) NOT NULL DEFAULT 0,
    uom                 VARCHAR(16),
    stat_time           TIMESTAMP,
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
CREATE UNIQUE INDEX uk_mes_kanban_wip_no ON mes_kanban_wip (wip_no);
CREATE INDEX idx_mes_kanban_wip_material ON mes_kanban_wip (material_code);
CREATE INDEX idx_mes_kanban_wip_line ON mes_kanban_wip (line_code);
CREATE INDEX idx_mes_kanban_wip_order ON mes_kanban_wip (work_order_no);
CREATE INDEX idx_mes_kanban_wip_time ON mes_kanban_wip (stat_time);

-- ========== 6. 异常安灯 ==========

CREATE TABLE mes_kanban_andon (
    id                  BIGINT        NOT NULL,
    andon_no            VARCHAR(64)   NOT NULL,
    line_code           VARCHAR(64),
    station_code        VARCHAR(64),
    andon_type          VARCHAR(32)   NOT NULL DEFAULT 'EQUIPMENT',
    andon_level         VARCHAR(32)   NOT NULL DEFAULT 'MEDIUM',
    andon_status        VARCHAR(32)   NOT NULL DEFAULT 'TRIGGERED',
    trigger_time        TIMESTAMP,
    response_time       TIMESTAMP,
    close_time          TIMESTAMP,
    trigger_by          VARCHAR(64),
    handler             VARCHAR(64),
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
CREATE UNIQUE INDEX uk_mes_kanban_andon_no ON mes_kanban_andon (andon_no);
CREATE INDEX idx_mes_kanban_andon_line ON mes_kanban_andon (line_code);
CREATE INDEX idx_mes_kanban_andon_type ON mes_kanban_andon (andon_type);
CREATE INDEX idx_mes_kanban_andon_status ON mes_kanban_andon (andon_status);
CREATE INDEX idx_mes_kanban_andon_trigger ON mes_kanban_andon (trigger_time);
