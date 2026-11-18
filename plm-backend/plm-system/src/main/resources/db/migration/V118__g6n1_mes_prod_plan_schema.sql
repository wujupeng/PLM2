-- G6-N1 MES—生产计划执行（WBS T037）表结构。
-- 主数据权责：MES 为生产工单执行、排产计划、派工与工序任务、进度反馈的权威源；
-- 生产工单接收 ERP（G3 生产订单）下达的工单，引用 PLM 物料/工艺，派工引用设备（后续 G6-N4）。
-- 覆盖范围：ERP工单接收、排产、派工、工序任务、进度反馈。

-- ========== 1. 生产工单（ERP工单接收） ==========

CREATE TABLE mes_prod_order (
    id               BIGINT        NOT NULL,
    order_no         VARCHAR(64)   NOT NULL,
    erp_order_no     VARCHAR(64),
    order_source     VARCHAR(32)   NOT NULL DEFAULT 'ERP',
    material_code    VARCHAR(64)   NOT NULL,
    material_name    VARCHAR(200),
    spec             VARCHAR(200),
    plan_qty         DECIMAL(18,4) NOT NULL DEFAULT 0,
    product_qty      DECIMAL(18,4) NOT NULL DEFAULT 0,
    order_status     VARCHAR(32)   NOT NULL DEFAULT 'DRAFT',
    priority         VARCHAR(32)   NOT NULL DEFAULT 'NORMAL',
    workshop_code    VARCHAR(64),
    plan_start_time  TIMESTAMP,
    plan_end_time    TIMESTAMP,
    receive_time     TIMESTAMP,
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
CREATE UNIQUE INDEX uk_mes_prod_order_no ON mes_prod_order (order_no);
CREATE INDEX idx_mes_prod_order_erp ON mes_prod_order (erp_order_no);
CREATE INDEX idx_mes_prod_order_material ON mes_prod_order (material_code);
CREATE INDEX idx_mes_prod_order_status ON mes_prod_order (order_status);
CREATE INDEX idx_mes_prod_order_workshop ON mes_prod_order (workshop_code);

-- ========== 2. 排产计划 ==========

CREATE TABLE mes_schedule (
    id                  BIGINT        NOT NULL,
    schedule_no         VARCHAR(64)   NOT NULL,
    work_order_no       VARCHAR(64),
    material_code       VARCHAR(64)   NOT NULL,
    material_name       VARCHAR(200),
    spec                VARCHAR(200),
    line_code           VARCHAR(64),
    plan_qty            DECIMAL(18,4) NOT NULL DEFAULT 0,
    scheduled_qty       DECIMAL(18,4) NOT NULL DEFAULT 0,
    schedule_start_time TIMESTAMP,
    schedule_end_time   TIMESTAMP,
    schedule_status     VARCHAR(32)   NOT NULL DEFAULT 'DRAFT',
    scheduler           VARCHAR(64),
    schedule_time       TIMESTAMP,
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
CREATE UNIQUE INDEX uk_mes_schedule_no ON mes_schedule (schedule_no);
CREATE INDEX idx_mes_schedule_work_order ON mes_schedule (work_order_no);
CREATE INDEX idx_mes_schedule_material ON mes_schedule (material_code);
CREATE INDEX idx_mes_schedule_line ON mes_schedule (line_code);
CREATE INDEX idx_mes_schedule_status ON mes_schedule (schedule_status);

-- ========== 3. 派工任务（工序任务 / 进度反馈） ==========

CREATE TABLE mes_dispatch (
    id              BIGINT        NOT NULL,
    dispatch_no     VARCHAR(64)   NOT NULL,
    work_order_no   VARCHAR(64),
    process_code    VARCHAR(64),
    process_name    VARCHAR(200),
    equipment_code  VARCHAR(64),
    line_code       VARCHAR(64),
    material_code   VARCHAR(64)   NOT NULL,
    material_name   VARCHAR(200),
    plan_qty        DECIMAL(18,4) NOT NULL DEFAULT 0,
    dispatched_qty  DECIMAL(18,4) NOT NULL DEFAULT 0,
    progress_qty    DECIMAL(18,4) NOT NULL DEFAULT 0,
    progress_rate   DECIMAL(9,4)  NOT NULL DEFAULT 0,
    dispatch_status VARCHAR(32)   NOT NULL DEFAULT 'DRAFT',
    operator        VARCHAR(64),
    dispatch_time   TIMESTAMP,
    feedback_time   TIMESTAMP,
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
CREATE UNIQUE INDEX uk_mes_dispatch_no ON mes_dispatch (dispatch_no);
CREATE INDEX idx_mes_dispatch_work_order ON mes_dispatch (work_order_no);
CREATE INDEX idx_mes_dispatch_process ON mes_dispatch (process_code);
CREATE INDEX idx_mes_dispatch_material ON mes_dispatch (material_code);
CREATE INDEX idx_mes_dispatch_status ON mes_dispatch (dispatch_status);
