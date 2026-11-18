-- G1-N2 公共平台底座—报表平台（对应总任务书 WBS T010）：
-- 统一指标口径、数据集市、权限过滤、导出审计和经营驾驶舱。
-- 说明：SQL 同时兼容 PostgreSQL 与 H2（PostgreSQL 兼容模式），主键由应用侧雪花算法生成。
-- 设计原则：
--   1) 指标口径统一先行：同一指标只允许一处定义（编码唯一），口径、计算公式、单位与数据来源
--      集中登记，避免各系统各报表各算一套导致数据打架。
--   2) 数据集市承载取数：数据集登记来源（表/视图/接口）、过滤条件与字段结构，报表只引用数据集，
--      不直接写库表，隔离底层模型变更对报表的影响。
--   3) 报表定义承载权限过滤与导出开关：报表声明查看权限码与数据权限过滤条件（行级过滤），
--      导出需审计，避免全员可见与数据越权导出。
--   4) 导出审计留痕：记录导出人、导出范围、行数、文件大小与结果，满足数据外发审计要求。
--   5) 经营驾驶舱装载组件布局：看板引用指标与报表，按角色/受众发布，支撑经营驾驶舱。
-- 注意：
--   a) 业务字段一律不得命名为 version，避免与 BaseEntity 的乐观锁字段 version 冲突。
--   b) 指标/数据集/报表/看板编码支持人工指定，且表上存在硬唯一索引；为与唯一索引保持一致，
--      本模块删除语义为「释放编码」，由服务层执行物理删除（与 G1-N1 幂等记录同一处理方式）。

-- ========== 指标口径（T010） ==========

CREATE TABLE sys_report_indicator (
    id               BIGINT       NOT NULL,
    indicator_code   VARCHAR(64)  NOT NULL,
    indicator_name   VARCHAR(200) NOT NULL,
    biz_domain       VARCHAR(32),
    category         VARCHAR(64),
    caliber          VARCHAR(1000),
    formula          VARCHAR(1000),
    unit             VARCHAR(32),
    decimal_scale    INT          NOT NULL DEFAULT 2,
    data_source      VARCHAR(128),
    refresh_cycle    VARCHAR(32)  NOT NULL DEFAULT 'DAILY',
    owner_name       VARCHAR(64),
    indicator_status VARCHAR(32)  NOT NULL DEFAULT 'DRAFT',
    description      VARCHAR(1000),
    org_id           BIGINT,
    org_name         VARCHAR(128),
    remark           VARCHAR(500),
    created_by       BIGINT,
    created_at       TIMESTAMP,
    updated_by       BIGINT,
    updated_at       TIMESTAMP,
    deleted          INT          NOT NULL DEFAULT 0,
    version          INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_sys_report_indicator_code ON sys_report_indicator (indicator_code);
CREATE INDEX idx_sys_report_indicator_domain ON sys_report_indicator (biz_domain);
CREATE INDEX idx_sys_report_indicator_status ON sys_report_indicator (indicator_status);

-- ========== 数据集市（T010） ==========

CREATE TABLE sys_report_dataset (
    id               BIGINT       NOT NULL,
    dataset_code     VARCHAR(64)  NOT NULL,
    dataset_name     VARCHAR(200) NOT NULL,
    biz_domain       VARCHAR(32),
    source_type      VARCHAR(32)  NOT NULL DEFAULT 'TABLE',
    source_ref       VARCHAR(255),
    filter_condition VARCHAR(1000),
    field_schema     TEXT,
    refresh_mode     VARCHAR(32)  NOT NULL DEFAULT 'MANUAL',
    refresh_cron     VARCHAR(64),
    last_refresh_at  TIMESTAMP,
    row_count        BIGINT       NOT NULL DEFAULT 0,
    owner_name       VARCHAR(64),
    dataset_status   VARCHAR(32)  NOT NULL DEFAULT 'DRAFT',
    description      VARCHAR(1000),
    org_id           BIGINT,
    org_name         VARCHAR(128),
    remark           VARCHAR(500),
    created_by       BIGINT,
    created_at       TIMESTAMP,
    updated_by       BIGINT,
    updated_at       TIMESTAMP,
    deleted          INT          NOT NULL DEFAULT 0,
    version          INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_sys_report_dataset_code ON sys_report_dataset (dataset_code);
CREATE INDEX idx_sys_report_dataset_domain ON sys_report_dataset (biz_domain);
CREATE INDEX idx_sys_report_dataset_status ON sys_report_dataset (dataset_status);

-- ========== 报表定义（T010） ==========

CREATE TABLE sys_report_definition (
    id                BIGINT       NOT NULL,
    report_code       VARCHAR(64)  NOT NULL,
    report_name       VARCHAR(200) NOT NULL,
    biz_domain        VARCHAR(32),
    category          VARCHAR(64),
    dataset_code      VARCHAR(64),
    chart_type        VARCHAR(32)  NOT NULL DEFAULT 'TABLE',
    indicator_codes   VARCHAR(500),
    permission_code   VARCHAR(64),
    row_filter        VARCHAR(1000),
    export_enabled    INT          NOT NULL DEFAULT 1,
    export_audit_flag INT          NOT NULL DEFAULT 1,
    report_status     VARCHAR(32)  NOT NULL DEFAULT 'DRAFT',
    owner_name        VARCHAR(64),
    description       VARCHAR(1000),
    org_id            BIGINT,
    org_name          VARCHAR(128),
    remark            VARCHAR(500),
    created_by        BIGINT,
    created_at        TIMESTAMP,
    updated_by        BIGINT,
    updated_at        TIMESTAMP,
    deleted           INT          NOT NULL DEFAULT 0,
    version           INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_sys_report_definition_code ON sys_report_definition (report_code);
CREATE INDEX idx_sys_report_definition_dataset ON sys_report_definition (dataset_code);
CREATE INDEX idx_sys_report_definition_status ON sys_report_definition (report_status);

-- ========== 导出审计（T010） ==========

CREATE TABLE sys_report_export_log (
    id             BIGINT       NOT NULL,
    export_no      VARCHAR(64)  NOT NULL,
    report_code    VARCHAR(64),
    report_name    VARCHAR(200),
    export_type    VARCHAR(32)  NOT NULL DEFAULT 'EXCEL',
    export_rows    INT          NOT NULL DEFAULT 0,
    file_size      BIGINT       NOT NULL DEFAULT 0,
    export_by      VARCHAR(64),
    export_time    TIMESTAMP,
    result_status  VARCHAR(32)  NOT NULL DEFAULT 'SUCCESS',
    ip_address     VARCHAR(64),
    filter_summary VARCHAR(1000),
    cost_ms        INT          NOT NULL DEFAULT 0,
    org_id         BIGINT,
    org_name       VARCHAR(128),
    remark         VARCHAR(500),
    created_by     BIGINT,
    created_at     TIMESTAMP,
    updated_by     BIGINT,
    updated_at     TIMESTAMP,
    deleted        INT          NOT NULL DEFAULT 0,
    version        INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_sys_report_export_log_no ON sys_report_export_log (export_no);
CREATE INDEX idx_sys_report_export_log_report ON sys_report_export_log (report_code);
CREATE INDEX idx_sys_report_export_log_status ON sys_report_export_log (result_status);

-- ========== 经营驾驶舱（T010） ==========

CREATE TABLE sys_report_dashboard (
    id                   BIGINT       NOT NULL,
    dashboard_code       VARCHAR(64)  NOT NULL,
    dashboard_name       VARCHAR(200) NOT NULL,
    biz_domain           VARCHAR(32),
    audience             VARCHAR(64),
    layout_mode          VARCHAR(32)  NOT NULL DEFAULT 'GRID',
    widget_schema        TEXT,
    refresh_interval_sec INT          NOT NULL DEFAULT 60,
    owner_name           VARCHAR(64),
    dashboard_status     VARCHAR(32)  NOT NULL DEFAULT 'DRAFT',
    description          VARCHAR(1000),
    org_id               BIGINT,
    org_name             VARCHAR(128),
    remark               VARCHAR(500),
    created_by           BIGINT,
    created_at           TIMESTAMP,
    updated_by           BIGINT,
    updated_at           TIMESTAMP,
    deleted              INT          NOT NULL DEFAULT 0,
    version              INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_sys_report_dashboard_code ON sys_report_dashboard (dashboard_code);
CREATE INDEX idx_sys_report_dashboard_domain ON sys_report_dashboard (biz_domain);
CREATE INDEX idx_sys_report_dashboard_status ON sys_report_dashboard (dashboard_status);
