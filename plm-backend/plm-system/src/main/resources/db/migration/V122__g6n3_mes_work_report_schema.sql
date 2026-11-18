-- G6-N3 MES—工序报工（WBS T039）表结构。
-- 主数据权责：MES 为工序报工（开工/暂停/完工、良品/不良/返工）、补料与工时的执行权威源；
-- 报工引用派工任务（G6-N1），补料引用 WMS 库存，工时归属操作工。
-- 覆盖范围：开工、暂停、完工、良品、不良、返工、补料、工时。

-- ========== 1. 工序报工（开工 / 暂停 / 完工 / 良品 / 不良 / 返工） ==========

CREATE TABLE mes_work_report (
    id               BIGINT        NOT NULL,
    report_no        VARCHAR(64)   NOT NULL,
    work_order_no    VARCHAR(64),
    dispatch_no      VARCHAR(64),
    process_code     VARCHAR(64),
    process_name     VARCHAR(200),
    material_code    VARCHAR(64)   NOT NULL,
    material_name    VARCHAR(200),
    equipment_code   VARCHAR(64),
    line_code        VARCHAR(64),
    operator         VARCHAR(64),
    shift_code       VARCHAR(32),
    report_type      VARCHAR(32)   NOT NULL DEFAULT 'START',
    good_qty         DECIMAL(18,4) NOT NULL DEFAULT 0,
    bad_qty          DECIMAL(18,4) NOT NULL DEFAULT 0,
    rework_qty       DECIMAL(18,4) NOT NULL DEFAULT 0,
    report_qty       DECIMAL(18,4) NOT NULL DEFAULT 0,
    start_time       TIMESTAMP,
    end_time         TIMESTAMP,
    duration_minutes DECIMAL(18,4) NOT NULL DEFAULT 0,
    work_hours       DECIMAL(18,4) NOT NULL DEFAULT 0,
    report_status    VARCHAR(32)   NOT NULL DEFAULT 'DRAFT',
    report_time      TIMESTAMP,
    org_id           BIGINT,
    org_name         VARCHAR(128),
    description      VARCHAR(1000),
    remark           VARCHAR(500),
    created_by       BIGINT,
    created_at       TIMESTAMP,
    updated_by       BIGINT,
    updated_at       TIMESTAMP,
    deleted          INT           NOT NULL DEFAULT 0,
    version          INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_mes_work_report_no ON mes_work_report (report_no);
CREATE INDEX idx_mes_work_report_work_order ON mes_work_report (work_order_no);
CREATE INDEX idx_mes_work_report_dispatch ON mes_work_report (dispatch_no);
CREATE INDEX idx_mes_work_report_process ON mes_work_report (process_code);
CREATE INDEX idx_mes_work_report_material ON mes_work_report (material_code);
CREATE INDEX idx_mes_work_report_status ON mes_work_report (report_status);

-- ========== 2. 补料记录 ==========

CREATE TABLE mes_material_replenish (
    id              BIGINT        NOT NULL,
    replenish_no    VARCHAR(64)   NOT NULL,
    work_order_no   VARCHAR(64),
    dispatch_no     VARCHAR(64),
    process_code    VARCHAR(64),
    material_code   VARCHAR(64)   NOT NULL,
    material_name   VARCHAR(200),
    spec            VARCHAR(200),
    batch_no        VARCHAR(64),
    replenish_qty   DECIMAL(18,4) NOT NULL DEFAULT 0,
    unit            VARCHAR(32),
    replenish_type  VARCHAR(32)   NOT NULL DEFAULT 'SUPPLEMENT',
    reason          VARCHAR(500),
    applicant       VARCHAR(64),
    apply_time      TIMESTAMP,
    replenish_status VARCHAR(32)  NOT NULL DEFAULT 'DRAFT',
    issuer          VARCHAR(64),
    issue_time      TIMESTAMP,
    org_id          BIGINT,
    org_name        VARCHAR(128),
    description     VARCHAR(1000),
    remark          VARCHAR(500),
    created_by      BIGINT,
    created_at      TIMESTAMP,
    updated_by      BIGINT,
    updated_at      TIMESTAMP,
    deleted         INT           NOT NULL DEFAULT 0,
    version         INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_mes_material_replenish_no ON mes_material_replenish (replenish_no);
CREATE INDEX idx_mes_material_replenish_work_order ON mes_material_replenish (work_order_no);
CREATE INDEX idx_mes_material_replenish_material ON mes_material_replenish (material_code);
CREATE INDEX idx_mes_material_replenish_status ON mes_material_replenish (replenish_status);

-- ========== 3. 工时记录 ==========

CREATE TABLE mes_labor_hour (
    id              BIGINT        NOT NULL,
    labor_no        VARCHAR(64)   NOT NULL,
    work_order_no   VARCHAR(64),
    dispatch_no     VARCHAR(64),
    process_code    VARCHAR(64),
    material_code   VARCHAR(64)   NOT NULL,
    material_name   VARCHAR(200),
    worker          VARCHAR(64),
    shift_code      VARCHAR(32),
    work_date       TIMESTAMP,
    normal_hours    DECIMAL(18,4) NOT NULL DEFAULT 0,
    overtime_hours  DECIMAL(18,4) NOT NULL DEFAULT 0,
    total_hours     DECIMAL(18,4) NOT NULL DEFAULT 0,
    labor_status    VARCHAR(32)   NOT NULL DEFAULT 'DRAFT',
    confirm_time    TIMESTAMP,
    org_id          BIGINT,
    org_name        VARCHAR(128),
    description     VARCHAR(1000),
    remark          VARCHAR(500),
    created_by      BIGINT,
    created_at      TIMESTAMP,
    updated_by      BIGINT,
    updated_at      TIMESTAMP,
    deleted         INT           NOT NULL DEFAULT 0,
    version         INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_mes_labor_hour_no ON mes_labor_hour (labor_no);
CREATE INDEX idx_mes_labor_hour_work_order ON mes_labor_hour (work_order_no);
CREATE INDEX idx_mes_labor_hour_worker ON mes_labor_hour (worker);
CREATE INDEX idx_mes_labor_hour_material ON mes_labor_hour (material_code);
CREATE INDEX idx_mes_labor_hour_status ON mes_labor_hour (labor_status);
