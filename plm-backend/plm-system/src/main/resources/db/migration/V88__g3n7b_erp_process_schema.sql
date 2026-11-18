-- G3-N7b ERP—工艺资源（对应总任务书 WBS T098 工艺资源，属 G3 ERP）。
-- 说明：SQL 同时兼容 PostgreSQL 与 H2（PostgreSQL 兼容模式），主键由应用侧雪花算法生成。
-- 设计原则：
--   1) 业务范围（T098）：资源资料（erp_process_resource）、标准工艺（erp_process_standard）、
--      工艺路线（erp_process_route）、工序计划（erp_process_plan）、工序报工（erp_process_report）、
--      工时反馈（erp_process_labor）。工序计划→工序报工→工时反馈构成现场作业闭环，
--      资源资料/标准工艺/工艺路线为工艺基础资料。
--   2) 主数据权责约束（见《主数据权责》表）：
--      物料权威源为 PLM，生产订单权威源为 ERP 生产模块；本模块以「编码/单号」引用，
--      不重复建表，仅维护工艺侧的资源、工艺与作业数据。
--   3) 平台公共能力复用（不重复建表）：组织（sys_organization）、法人（sys_legal_entity）、
--      工厂（sys_factory）、单据状态机（sys_doc_state_*）、审批（oa_process_*）由 G1 平台底座提供，
--      本模块按编码引用；资源类型、路线类型、计划/报工/工时状态等业务语义字段在本模块内维护。
--   4) 单据编号规则：*_no 支持人工指定，未指定时由服务层按统一前缀自动生成；
--      主数据编码（resource_code/standard_code/route_code）由用户指定，服务层保证唯一。
-- 注意：
--   a) 业务字段一律不得命名为 version，避免与 BaseEntity 的乐观锁字段 version 冲突，
--      故版本字段统一命名为 version_no。
--   b) 具备业务编码唯一索引的表删除语义为「释放编码」，由服务层执行物理删除；
--      其余明细表随头删除时逻辑删除即可（本节点 6 张表均为编码唯一的主数据/单据表，统一物理删除）。
--   c) 多法人多工厂：各单据以 org_id/org_name 归属组织（法人/工厂）。

-- ========== T098 ERP 资源资料（设备/模具/工装/量具/人工等产能资源） ==========

CREATE TABLE erp_process_resource (
    id              BIGINT         NOT NULL,
    resource_code   VARCHAR(64)    NOT NULL,
    resource_name   VARCHAR(200),
    resource_type   VARCHAR(32)    NOT NULL DEFAULT 'MACHINE',
    spec            VARCHAR(200),
    resource_group  VARCHAR(64),
    work_center     VARCHAR(64),
    capacity        DECIMAL(18, 2) NOT NULL DEFAULT 0,
    capacity_unit   VARCHAR(32),
    uom             VARCHAR(32),
    resource_status VARCHAR(32)    NOT NULL DEFAULT 'ACTIVE',
    org_id          BIGINT,
    org_name        VARCHAR(128),
    description     VARCHAR(1000),
    remark          VARCHAR(500),
    created_by      BIGINT,
    created_at      TIMESTAMP,
    updated_by      BIGINT,
    updated_at      TIMESTAMP,
    deleted         INT            NOT NULL DEFAULT 0,
    version         INT            NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_erp_process_resource_code ON erp_process_resource (resource_code);
CREATE INDEX idx_erp_process_resource_type ON erp_process_resource (resource_type);

-- ========== T098 ERP 标准工艺（物料标准工艺与标准工时） ==========

CREATE TABLE erp_process_standard (
    id               BIGINT         NOT NULL,
    standard_code    VARCHAR(64)    NOT NULL,
    standard_name    VARCHAR(200),
    material_code    VARCHAR(64),
    material_name    VARCHAR(200),
    version_no       VARCHAR(32),
    route_code       VARCHAR(64),
    standard_hours   DECIMAL(18, 2) NOT NULL DEFAULT 0,
    setup_hours      DECIMAL(18, 2) NOT NULL DEFAULT 0,
    operation_count  INT            NOT NULL DEFAULT 0,
    effective_date   DATE,
    expire_date      DATE,
    standard_status  VARCHAR(32)    NOT NULL DEFAULT 'DRAFT',
    org_id           BIGINT,
    org_name         VARCHAR(128),
    description      VARCHAR(1000),
    remark           VARCHAR(500),
    created_by       BIGINT,
    created_at       TIMESTAMP,
    updated_by       BIGINT,
    updated_at       TIMESTAMP,
    deleted          INT            NOT NULL DEFAULT 0,
    version          INT            NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_erp_process_standard_code ON erp_process_standard (standard_code);
CREATE INDEX idx_erp_process_standard_material ON erp_process_standard (material_code);

-- ========== T098 ERP 工艺路线（主/替代路线与工序构成） ==========

CREATE TABLE erp_process_route (
    id              BIGINT         NOT NULL,
    route_code      VARCHAR(64)    NOT NULL,
    route_name      VARCHAR(200),
    material_code   VARCHAR(64),
    material_name   VARCHAR(200),
    version_no      VARCHAR(32),
    route_type      VARCHAR(32)    NOT NULL DEFAULT 'MAIN',
    route_status    VARCHAR(32)    NOT NULL DEFAULT 'DRAFT',
    operation_count INT            NOT NULL DEFAULT 0,
    standard_code   VARCHAR(64),
    org_id          BIGINT,
    org_name        VARCHAR(128),
    description     VARCHAR(1000),
    remark          VARCHAR(500),
    created_by      BIGINT,
    created_at      TIMESTAMP,
    updated_by      BIGINT,
    updated_at      TIMESTAMP,
    deleted         INT            NOT NULL DEFAULT 0,
    version         INT            NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_erp_process_route_code ON erp_process_route (route_code);
CREATE INDEX idx_erp_process_route_material ON erp_process_route (material_code);

-- ========== T098 ERP 工序计划（按生产订单排定工序与资源） ==========

CREATE TABLE erp_process_plan (
    id                  BIGINT         NOT NULL,
    plan_no             VARCHAR(64)    NOT NULL,
    production_order_no VARCHAR(64),
    material_code       VARCHAR(64),
    material_name       VARCHAR(200),
    route_code          VARCHAR(64),
    operation_no        INT,
    operation_name      VARCHAR(200),
    resource_code       VARCHAR(64),
    plan_qty            DECIMAL(18, 2) NOT NULL DEFAULT 0,
    planned_start_time  TIMESTAMP,
    planned_end_time    TIMESTAMP,
    plan_status         VARCHAR(32)    NOT NULL DEFAULT 'PENDING',
    org_id              BIGINT,
    org_name            VARCHAR(128),
    description         VARCHAR(1000),
    remark              VARCHAR(500),
    created_by          BIGINT,
    created_at          TIMESTAMP,
    updated_by          BIGINT,
    updated_at          TIMESTAMP,
    deleted             INT            NOT NULL DEFAULT 0,
    version             INT            NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_erp_process_plan_no ON erp_process_plan (plan_no);
CREATE INDEX idx_erp_process_plan_order ON erp_process_plan (production_order_no);

-- ========== T098 ERP 工序报工（合格/不合格/报废数量回报） ==========

CREATE TABLE erp_process_report (
    id                  BIGINT         NOT NULL,
    report_no           VARCHAR(64)    NOT NULL,
    plan_no             VARCHAR(64),
    production_order_no VARCHAR(64),
    material_code       VARCHAR(64),
    operation_no        INT,
    qualified_qty       DECIMAL(18, 2) NOT NULL DEFAULT 0,
    unqualified_qty     DECIMAL(18, 2) NOT NULL DEFAULT 0,
    scrap_qty           DECIMAL(18, 2) NOT NULL DEFAULT 0,
    reporter            VARCHAR(128),
    report_time         TIMESTAMP,
    report_status       VARCHAR(32)    NOT NULL DEFAULT 'SUBMITTED',
    org_id              BIGINT,
    org_name            VARCHAR(128),
    description         VARCHAR(1000),
    remark              VARCHAR(500),
    created_by          BIGINT,
    created_at          TIMESTAMP,
    updated_by          BIGINT,
    updated_at          TIMESTAMP,
    deleted             INT            NOT NULL DEFAULT 0,
    version             INT            NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_erp_process_report_no ON erp_process_report (report_no);
CREATE INDEX idx_erp_process_report_plan ON erp_process_report (plan_no);

-- ========== T098 ERP 工时反馈（标准/实际工时与起止时间反馈） ==========

CREATE TABLE erp_process_labor (
    id             BIGINT         NOT NULL,
    feedback_no    VARCHAR(64)    NOT NULL,
    plan_no        VARCHAR(64),
    report_no      VARCHAR(64),
    resource_code  VARCHAR(64),
    operator_name  VARCHAR(128),
    labor_type     VARCHAR(32)    NOT NULL DEFAULT 'RUN',
    standard_hours DECIMAL(18, 2) NOT NULL DEFAULT 0,
    actual_hours   DECIMAL(18, 2) NOT NULL DEFAULT 0,
    start_time     TIMESTAMP,
    end_time       TIMESTAMP,
    labor_status   VARCHAR(32)    NOT NULL DEFAULT 'DRAFT',
    org_id         BIGINT,
    org_name       VARCHAR(128),
    description    VARCHAR(1000),
    remark         VARCHAR(500),
    created_by     BIGINT,
    created_at     TIMESTAMP,
    updated_by     BIGINT,
    updated_at     TIMESTAMP,
    deleted        INT            NOT NULL DEFAULT 0,
    version        INT            NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_erp_process_labor_no ON erp_process_labor (feedback_no);
CREATE INDEX idx_erp_process_labor_plan ON erp_process_labor (plan_no);
