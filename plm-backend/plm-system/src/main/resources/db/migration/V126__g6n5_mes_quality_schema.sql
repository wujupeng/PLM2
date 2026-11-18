-- G6-N5 MES—质量检验（WBS T041）表结构。
-- 主数据权责：MES 为检验规范、来料/首件/巡检/末件/终检执行记录、检验判定与隔离处置的执行权威源；
-- 物料引用 PLM 物料主数据，来料检验引用 SRM 供应商/采购订单，生产检验引用 MES 工单/派工/工艺。
-- 覆盖范围：检验规范、来料检验、首件检验、巡检、末件检验、终检、检验判定、隔离。

-- ========== 1. 检验规范 ==========

CREATE TABLE mes_inspection_spec (
    id                  BIGINT        NOT NULL,
    spec_no             VARCHAR(64)   NOT NULL,
    spec_name           VARCHAR(200),
    spec_type           VARCHAR(32)   NOT NULL DEFAULT 'INCOMING',
    material_code       VARCHAR(64),
    material_name       VARCHAR(200),
    process_code        VARCHAR(64),
    inspection_item     VARCHAR(200),
    inspection_method   VARCHAR(200),
    standard_value      VARCHAR(200),
    upper_limit         DECIMAL(18,4),
    lower_limit         DECIMAL(18,4),
    sample_plan         VARCHAR(200),
    aql                 VARCHAR(64),
    spec_version        VARCHAR(32),
    spec_status         VARCHAR(32)   NOT NULL DEFAULT 'DRAFT',
    effective_date      TIMESTAMP,
    expire_date         TIMESTAMP,
    owner               VARCHAR(64),
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
CREATE UNIQUE INDEX uk_mes_inspection_spec_no ON mes_inspection_spec (spec_no);
CREATE INDEX idx_mes_inspection_spec_type ON mes_inspection_spec (spec_type);
CREATE INDEX idx_mes_inspection_spec_material ON mes_inspection_spec (material_code);
CREATE INDEX idx_mes_inspection_spec_status ON mes_inspection_spec (spec_status);

-- ========== 2. 来料检验单 ==========

CREATE TABLE mes_incoming_inspection (
    id                  BIGINT        NOT NULL,
    incoming_no         VARCHAR(64)   NOT NULL,
    material_code       VARCHAR(64)   NOT NULL,
    material_name       VARCHAR(200),
    spec                VARCHAR(200),
    batch_no            VARCHAR(64),
    supplier_code       VARCHAR(64),
    supplier_name       VARCHAR(200),
    purchase_order_no   VARCHAR(64),
    inspection_qty      DECIMAL(18,4) NOT NULL DEFAULT 0,
    sample_qty          DECIMAL(18,4) NOT NULL DEFAULT 0,
    qualified_qty       DECIMAL(18,4) NOT NULL DEFAULT 0,
    unqualified_qty     DECIMAL(18,4) NOT NULL DEFAULT 0,
    inspection_result   VARCHAR(32),
    inspection_status   VARCHAR(32)   NOT NULL DEFAULT 'PENDING',
    inspector           VARCHAR(64),
    inspection_time     TIMESTAMP,
    judge_no            VARCHAR(64),
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
CREATE UNIQUE INDEX uk_mes_incoming_inspection_no ON mes_incoming_inspection (incoming_no);
CREATE INDEX idx_mes_incoming_inspection_material ON mes_incoming_inspection (material_code);
CREATE INDEX idx_mes_incoming_inspection_supplier ON mes_incoming_inspection (supplier_code);
CREATE INDEX idx_mes_incoming_inspection_status ON mes_incoming_inspection (inspection_status);

-- ========== 3. 首件检验单 ==========

CREATE TABLE mes_first_inspection (
    id                  BIGINT        NOT NULL,
    first_no            VARCHAR(64)   NOT NULL,
    work_order_no       VARCHAR(64),
    dispatch_no         VARCHAR(64),
    material_code       VARCHAR(64)   NOT NULL,
    material_name       VARCHAR(200),
    process_code        VARCHAR(64),
    process_name        VARCHAR(200),
    equipment_code      VARCHAR(64),
    batch_no            VARCHAR(64),
    inspection_item     VARCHAR(200),
    inspection_result   VARCHAR(32),
    inspection_status   VARCHAR(32)   NOT NULL DEFAULT 'PENDING',
    inspector           VARCHAR(64),
    inspection_time     TIMESTAMP,
    judge_no            VARCHAR(64),
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
CREATE UNIQUE INDEX uk_mes_first_inspection_no ON mes_first_inspection (first_no);
CREATE INDEX idx_mes_first_inspection_work_order ON mes_first_inspection (work_order_no);
CREATE INDEX idx_mes_first_inspection_material ON mes_first_inspection (material_code);
CREATE INDEX idx_mes_first_inspection_equipment ON mes_first_inspection (equipment_code);
CREATE INDEX idx_mes_first_inspection_status ON mes_first_inspection (inspection_status);

-- ========== 4. 巡检记录 ==========

CREATE TABLE mes_patrol_inspection (
    id                  BIGINT        NOT NULL,
    patrol_no           VARCHAR(64)   NOT NULL,
    work_order_no       VARCHAR(64),
    material_code       VARCHAR(64)   NOT NULL,
    material_name       VARCHAR(200),
    process_code        VARCHAR(64),
    process_name        VARCHAR(200),
    equipment_code      VARCHAR(64),
    inspection_item     VARCHAR(200),
    standard_value      VARCHAR(200),
    actual_value        VARCHAR(200),
    inspection_result   VARCHAR(32),
    inspection_status   VARCHAR(32)   NOT NULL DEFAULT 'PENDING',
    inspector           VARCHAR(64),
    inspection_time     TIMESTAMP,
    shift_code          VARCHAR(32),
    judge_no            VARCHAR(64),
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
CREATE UNIQUE INDEX uk_mes_patrol_inspection_no ON mes_patrol_inspection (patrol_no);
CREATE INDEX idx_mes_patrol_inspection_work_order ON mes_patrol_inspection (work_order_no);
CREATE INDEX idx_mes_patrol_inspection_material ON mes_patrol_inspection (material_code);
CREATE INDEX idx_mes_patrol_inspection_equipment ON mes_patrol_inspection (equipment_code);
CREATE INDEX idx_mes_patrol_inspection_status ON mes_patrol_inspection (inspection_status);

-- ========== 5. 末件检验单 ==========

CREATE TABLE mes_last_inspection (
    id                  BIGINT        NOT NULL,
    last_no             VARCHAR(64)   NOT NULL,
    work_order_no       VARCHAR(64),
    dispatch_no         VARCHAR(64),
    material_code       VARCHAR(64)   NOT NULL,
    material_name       VARCHAR(200),
    process_code        VARCHAR(64),
    process_name        VARCHAR(200),
    equipment_code      VARCHAR(64),
    batch_no            VARCHAR(64),
    inspection_item     VARCHAR(200),
    inspection_result   VARCHAR(32),
    inspection_status   VARCHAR(32)   NOT NULL DEFAULT 'PENDING',
    inspector           VARCHAR(64),
    inspection_time     TIMESTAMP,
    judge_no            VARCHAR(64),
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
CREATE UNIQUE INDEX uk_mes_last_inspection_no ON mes_last_inspection (last_no);
CREATE INDEX idx_mes_last_inspection_work_order ON mes_last_inspection (work_order_no);
CREATE INDEX idx_mes_last_inspection_material ON mes_last_inspection (material_code);
CREATE INDEX idx_mes_last_inspection_equipment ON mes_last_inspection (equipment_code);
CREATE INDEX idx_mes_last_inspection_status ON mes_last_inspection (inspection_status);

-- ========== 6. 终检记录 ==========

CREATE TABLE mes_final_inspection (
    id                  BIGINT        NOT NULL,
    final_no            VARCHAR(64)   NOT NULL,
    work_order_no       VARCHAR(64),
    material_code       VARCHAR(64)   NOT NULL,
    material_name       VARCHAR(200),
    spec                VARCHAR(200),
    batch_no            VARCHAR(64),
    inspection_qty      DECIMAL(18,4) NOT NULL DEFAULT 0,
    sample_qty          DECIMAL(18,4) NOT NULL DEFAULT 0,
    qualified_qty       DECIMAL(18,4) NOT NULL DEFAULT 0,
    unqualified_qty     DECIMAL(18,4) NOT NULL DEFAULT 0,
    inspection_result   VARCHAR(32),
    inspection_status   VARCHAR(32)   NOT NULL DEFAULT 'PENDING',
    inspector           VARCHAR(64),
    inspection_time     TIMESTAMP,
    judge_no            VARCHAR(64),
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
CREATE UNIQUE INDEX uk_mes_final_inspection_no ON mes_final_inspection (final_no);
CREATE INDEX idx_mes_final_inspection_work_order ON mes_final_inspection (work_order_no);
CREATE INDEX idx_mes_final_inspection_material ON mes_final_inspection (material_code);
CREATE INDEX idx_mes_final_inspection_customer ON mes_final_inspection (customer_code);
CREATE INDEX idx_mes_final_inspection_status ON mes_final_inspection (inspection_status);

-- ========== 7. 检验判定 ==========

CREATE TABLE mes_inspection_judge (
    id                  BIGINT        NOT NULL,
    judge_no            VARCHAR(64)   NOT NULL,
    source_type         VARCHAR(32)   NOT NULL DEFAULT 'INCOMING',
    source_no           VARCHAR(64),
    material_code       VARCHAR(64)   NOT NULL,
    material_name       VARCHAR(200),
    batch_no            VARCHAR(64),
    judge_result        VARCHAR(32)   NOT NULL DEFAULT 'PASS',
    judge_status        VARCHAR(32)   NOT NULL DEFAULT 'DRAFT',
    judge_qty           DECIMAL(18,4) NOT NULL DEFAULT 0,
    qualified_qty       DECIMAL(18,4) NOT NULL DEFAULT 0,
    unqualified_qty     DECIMAL(18,4) NOT NULL DEFAULT 0,
    judge_opinion       VARCHAR(500),
    disposition         VARCHAR(200),
    judge_by            VARCHAR(64),
    judge_time          TIMESTAMP,
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
CREATE UNIQUE INDEX uk_mes_inspection_judge_no ON mes_inspection_judge (judge_no);
CREATE INDEX idx_mes_inspection_judge_source ON mes_inspection_judge (source_no);
CREATE INDEX idx_mes_inspection_judge_material ON mes_inspection_judge (material_code);
CREATE INDEX idx_mes_inspection_judge_result ON mes_inspection_judge (judge_result);
CREATE INDEX idx_mes_inspection_judge_status ON mes_inspection_judge (judge_status);

-- ========== 8. 隔离记录 ==========

CREATE TABLE mes_quarantine (
    id                  BIGINT        NOT NULL,
    quarantine_no       VARCHAR(64)   NOT NULL,
    material_code       VARCHAR(64)   NOT NULL,
    material_name       VARCHAR(200),
    batch_no            VARCHAR(64),
    quarantine_qty      DECIMAL(18,4) NOT NULL DEFAULT 0,
    quarantine_type     VARCHAR(32)   NOT NULL DEFAULT 'SUSPECT',
    quarantine_status   VARCHAR(32)   NOT NULL DEFAULT 'PENDING',
    source_no           VARCHAR(64),
    location            VARCHAR(200),
    reason              VARCHAR(500),
    applicant           VARCHAR(64),
    apply_time          TIMESTAMP,
    handler             VARCHAR(64),
    handle_time         TIMESTAMP,
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
CREATE UNIQUE INDEX uk_mes_quarantine_no ON mes_quarantine (quarantine_no);
CREATE INDEX idx_mes_quarantine_material ON mes_quarantine (material_code);
CREATE INDEX idx_mes_quarantine_type ON mes_quarantine (quarantine_type);
CREATE INDEX idx_mes_quarantine_status ON mes_quarantine (quarantine_status);
