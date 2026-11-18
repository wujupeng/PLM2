-- OA-N11 安全性能测试与用户验收：功能/回归测试集、权限测试、安全测试、性能测试、兼容测试、
-- 备份恢复演练、用户验收(UAT)、培训交付、上线切换与回退预案。
-- 说明：SQL 同时兼容 PostgreSQL 与 H2（PostgreSQL 兼容模式），主键由应用侧雪花算法生成。
-- 设计原则：
--   1) 测试以"用例库 + 分类测试记录 + 结论"为主干：功能与回归测试集建立需求到页面/API/数据表/用例的追踪关系
--      （OA-DEV-105），权限测试覆盖跨部门/跨工厂/离职/代理/管理员/外部用户的数据隔离（OA-DEV-106），
--      安全测试覆盖代码扫描/依赖扫描/渗透/弱口令/文件上传/会话检查（OA-DEV-107），
--      性能测试记录并发、容量、目标与实测（OA-DEV-108），兼容测试覆盖浏览器/分辨率/移动端（OA-DEV-109），
--      备份恢复演练记录 RPO/RTO 目标与实测（OA-DEV-110）。
--   2) 验收与交付以"UAT 记录 + 培训材料 + 切换预案"为主干（OA-DEV-111/112/113）；
--      切换预案区分切换与回退，明确切换窗口、冻结、增量同步、入口切换、值守与回退触发条件。
--   3) 目标值（并发、响应、RPO/RTO、通过率、切换窗口等）均为可配置项（sys_config）并标记待业务方确认。
-- 注意：业务字段一律不得命名为 version，避免与 BaseEntity 的乐观锁字段 version 冲突。

-- ========== 功能与回归测试集（OA-DEV-105） ==========

CREATE TABLE oa_test_case (
    id                BIGINT       NOT NULL,
    case_no           VARCHAR(64)  NOT NULL,
    case_name         VARCHAR(200) NOT NULL,
    module            VARCHAR(64),
    requirement_ref   VARCHAR(64),
    page_ref          VARCHAR(200),
    api_ref           VARCHAR(200),
    table_ref         VARCHAR(200),
    case_type         VARCHAR(32)  NOT NULL DEFAULT 'FUNCTION',
    priority          VARCHAR(8)   NOT NULL DEFAULT 'P1',
    precondition      VARCHAR(1000),
    steps             TEXT,
    expected          TEXT,
    exec_status       VARCHAR(32)  NOT NULL DEFAULT 'NOT_RUN',
    test_result       VARCHAR(1000),
    tester            VARCHAR(64),
    last_run_time     TIMESTAMP,
    status            INT          NOT NULL DEFAULT 1,
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
CREATE UNIQUE INDEX uk_oa_test_case_no ON oa_test_case (case_no);
CREATE INDEX idx_oa_test_case_module ON oa_test_case (module);
CREATE INDEX idx_oa_test_case_priority ON oa_test_case (priority);
CREATE INDEX idx_oa_test_case_status ON oa_test_case (exec_status);

-- ========== 角色与数据隔离测试（OA-DEV-106） ==========

CREATE TABLE oa_permission_test (
    id                BIGINT       NOT NULL,
    test_no           VARCHAR(64)  NOT NULL,
    scene_name        VARCHAR(200) NOT NULL,
    scene_type        VARCHAR(32)  NOT NULL DEFAULT 'CROSS_DEPT',
    role_name         VARCHAR(64),
    subject           VARCHAR(200),
    data_scope        VARCHAR(200),
    expected_result   VARCHAR(1000),
    actual_result     VARCHAR(1000),
    isolation_pass    INT          NOT NULL DEFAULT 0,
    result            VARCHAR(32)  NOT NULL DEFAULT 'PENDING',
    defect_no         VARCHAR(64),
    tester            VARCHAR(64),
    test_time         TIMESTAMP,
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
CREATE UNIQUE INDEX uk_oa_permission_test_no ON oa_permission_test (test_no);
CREATE INDEX idx_oa_permission_test_type ON oa_permission_test (scene_type);
CREATE INDEX idx_oa_permission_test_result ON oa_permission_test (result);

-- ========== 安全测试（OA-DEV-107） ==========

CREATE TABLE oa_security_test (
    id                BIGINT       NOT NULL,
    scan_no           VARCHAR(64)  NOT NULL,
    check_name        VARCHAR(200) NOT NULL,
    check_type        VARCHAR(32)  NOT NULL DEFAULT 'CODE_SCAN',
    severity          VARCHAR(16)  NOT NULL DEFAULT 'MEDIUM',
    target            VARCHAR(200),
    tool_name         VARCHAR(64),
    finding           VARCHAR(1000),
    suggestion        VARCHAR(1000),
    fix_status        VARCHAR(32)  NOT NULL DEFAULT 'OPEN',
    risk_accepted     INT          NOT NULL DEFAULT 0,
    verify_result     VARCHAR(200),
    tester            VARCHAR(64),
    test_time         TIMESTAMP,
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
CREATE UNIQUE INDEX uk_oa_security_test_no ON oa_security_test (scan_no);
CREATE INDEX idx_oa_security_test_type ON oa_security_test (check_type);
CREATE INDEX idx_oa_security_test_severity ON oa_security_test (severity);
CREATE INDEX idx_oa_security_test_fix ON oa_security_test (fix_status);

-- ========== 性能与容量测试（OA-DEV-108） ==========

CREATE TABLE oa_perf_test (
    id                BIGINT       NOT NULL,
    test_no           VARCHAR(64)  NOT NULL,
    scene_name        VARCHAR(200) NOT NULL,
    load_model        VARCHAR(200),
    concurrent_users  INT          NOT NULL DEFAULT 0,
    flow_concurrency  INT          NOT NULL DEFAULT 0,
    mail_volume       BIGINT       NOT NULL DEFAULT 0,
    doc_volume        BIGINT       NOT NULL DEFAULT 0,
    attach_capacity   BIGINT       NOT NULL DEFAULT 0,
    target_tps        INT          NOT NULL DEFAULT 0,
    target_rt_ms      INT          NOT NULL DEFAULT 0,
    actual_tps        INT          NOT NULL DEFAULT 0,
    actual_rt_ms      INT          NOT NULL DEFAULT 0,
    error_rate        NUMERIC(10,2) NOT NULL DEFAULT 0,
    cpu_usage         NUMERIC(10,2) NOT NULL DEFAULT 0,
    mem_usage         NUMERIC(10,2) NOT NULL DEFAULT 0,
    result            VARCHAR(32)  NOT NULL DEFAULT 'PENDING',
    tester            VARCHAR(64),
    test_time         TIMESTAMP,
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
CREATE UNIQUE INDEX uk_oa_perf_test_no ON oa_perf_test (test_no);
CREATE INDEX idx_oa_perf_test_result ON oa_perf_test (result);

-- ========== 兼容性测试（OA-DEV-109） ==========

CREATE TABLE oa_compat_test (
    id                BIGINT       NOT NULL,
    test_no           VARCHAR(64)  NOT NULL,
    env_type          VARCHAR(32)  NOT NULL DEFAULT 'BROWSER',
    env_name          VARCHAR(200) NOT NULL,
    env_version       VARCHAR(64),
    network           VARCHAR(64),
    scene             VARCHAR(200),
    result            VARCHAR(32)  NOT NULL DEFAULT 'PENDING',
    block_level       VARCHAR(16),
    issue             VARCHAR(1000),
    tester            VARCHAR(64),
    test_time         TIMESTAMP,
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
CREATE UNIQUE INDEX uk_oa_compat_test_no ON oa_compat_test (test_no);
CREATE INDEX idx_oa_compat_test_env ON oa_compat_test (env_type);
CREATE INDEX idx_oa_compat_test_result ON oa_compat_test (result);

-- ========== 备份恢复演练（OA-DEV-110） ==========

CREATE TABLE oa_backup_drill (
    id                BIGINT       NOT NULL,
    drill_no          VARCHAR(64)  NOT NULL,
    drill_name        VARCHAR(200) NOT NULL,
    drill_type        VARCHAR(32)  NOT NULL DEFAULT 'DB',
    backup_source     VARCHAR(200),
    backup_time       TIMESTAMP,
    target_rpo_minutes INT         NOT NULL DEFAULT 0,
    target_rto_minutes INT         NOT NULL DEFAULT 0,
    restore_start     TIMESTAMP,
    restore_end       TIMESTAMP,
    actual_rpo_minutes INT         NOT NULL DEFAULT 0,
    actual_rto_minutes INT         NOT NULL DEFAULT 0,
    restore_result    VARCHAR(32)  NOT NULL DEFAULT 'PENDING',
    data_verified     INT          NOT NULL DEFAULT 0,
    operator_name     VARCHAR(64),
    drill_time        TIMESTAMP,
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
CREATE UNIQUE INDEX uk_oa_backup_drill_no ON oa_backup_drill (drill_no);
CREATE INDEX idx_oa_backup_drill_type ON oa_backup_drill (drill_type);
CREATE INDEX idx_oa_backup_drill_result ON oa_backup_drill (restore_result);

-- ========== 用户验收(UAT)记录（OA-DEV-111） ==========

CREATE TABLE oa_uat_record (
    id                BIGINT       NOT NULL,
    uat_no            VARCHAR(64)  NOT NULL,
    dept              VARCHAR(64)  NOT NULL,
    scene_name        VARCHAR(200) NOT NULL,
    scenario_ref      VARCHAR(64),
    uat_status        VARCHAR(32)  NOT NULL DEFAULT 'PENDING',
    owner_dept        VARCHAR(64),
    participant       VARCHAR(200),
    expected          VARCHAR(1000),
    actual            VARCHAR(1000),
    issue_count       INT          NOT NULL DEFAULT 0,
    blocker_count     INT          NOT NULL DEFAULT 0,
    conclusion        VARCHAR(1000),
    uat_time          TIMESTAMP,
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
CREATE UNIQUE INDEX uk_oa_uat_record_no ON oa_uat_record (uat_no);
CREATE INDEX idx_oa_uat_record_dept ON oa_uat_record (dept);
CREATE INDEX idx_oa_uat_record_status ON oa_uat_record (uat_status);

-- ========== 培训交付材料（OA-DEV-112） ==========

CREATE TABLE oa_training_material (
    id                BIGINT       NOT NULL,
    material_no       VARCHAR(64)  NOT NULL,
    material_name     VARCHAR(200) NOT NULL,
    material_type     VARCHAR(32)  NOT NULL DEFAULT 'MANUAL',
    target_role       VARCHAR(64),
    format            VARCHAR(32),
    location          VARCHAR(500),
    material_version  VARCHAR(32),
    publish_time      TIMESTAMP,
    audience_count    INT          NOT NULL DEFAULT 0,
    signed_count      INT          NOT NULL DEFAULT 0,
    status            INT          NOT NULL DEFAULT 1,
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
CREATE UNIQUE INDEX uk_oa_training_material_no ON oa_training_material (material_no);
CREATE INDEX idx_oa_training_material_type ON oa_training_material (material_type);
CREATE INDEX idx_oa_training_material_role ON oa_training_material (target_role);

-- ========== 上线切换与回退预案（OA-DEV-113） ==========

CREATE TABLE oa_cutover_plan (
    id                BIGINT       NOT NULL,
    plan_no           VARCHAR(64)  NOT NULL,
    plan_name         VARCHAR(200) NOT NULL,
    plan_type         VARCHAR(32)  NOT NULL DEFAULT 'CUTOVER',
    cutover_window    VARCHAR(200),
    freeze_time       TIMESTAMP,
    increment_sync    VARCHAR(200),
    entry_switch      VARCHAR(200),
    notify_plan       VARCHAR(1000),
    duty_person       VARCHAR(200),
    rollback_trigger  VARCHAR(1000),
    rollback_owner    VARCHAR(64),
    rehearsal_result  VARCHAR(32)  NOT NULL DEFAULT 'NOT_RUN',
    rehearsal_time    TIMESTAMP,
    status            VARCHAR(32)  NOT NULL DEFAULT 'DRAFT',
    approver          VARCHAR(64),
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
CREATE UNIQUE INDEX uk_oa_cutover_plan_no ON oa_cutover_plan (plan_no);
CREATE INDEX idx_oa_cutover_plan_type ON oa_cutover_plan (plan_type);
CREATE INDEX idx_oa_cutover_plan_status ON oa_cutover_plan (status);
