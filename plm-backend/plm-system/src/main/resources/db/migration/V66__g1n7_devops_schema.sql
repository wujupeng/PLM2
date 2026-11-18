-- G1-N7 公共平台底座—DevSecOps（对应总任务书 WBS T012，公共平台）：
-- 代码仓库、分支策略、CI/CD、自动化测试、制品库、漏洞扫描和环境隔离。
-- 说明：SQL 同时兼容 PostgreSQL 与 H2（PostgreSQL 兼容模式），主键由应用侧雪花算法生成。
-- 设计原则：
--   1) 代码仓库（repository）登记仓库编码、类型（GIT/SVN）、地址、分支策略与所属系统域，
--      支撑统一仓库治理与分支规范落地。
--   2) 流水线（pipeline）登记 CI/CD 流水线，关联仓库与触发方式（推送/手动/定时），
--      作为自动化测试、制品构建与部署的统一编排入口。
--   3) 环境（environment）登记环境编码、类型（开发/测试/验收/生产）、部署目标与是否隔离，
--      落实环境隔离与多环境部署治理。
--   4) 构建部署记录（build run）逐次记录流水线运行：构建号、环境、提交号、结果、起止时间、
--      耗时与制品引用，作为可追溯的交付记录。
--   5) 质量与安全门禁（gate）记录自动化测试、覆盖率、代码扫描、漏洞扫描与性能等门禁的阈值、
--      结果、问题数与严重级别，未通过门禁的流水线不得进入下一环节。
-- 注意：
--   a) 业务字段一律不得命名为 version，避免与 BaseEntity 的乐观锁字段 version 冲突。
--   b) 各表主编码/唯一键存在硬唯一索引；为与唯一索引保持一致，本模块删除语义为「释放编码」，
--      由服务层执行物理删除（与 G1-N1 及其后各节点同一处理方式）。

-- ========== T012 代码仓库 ==========

CREATE TABLE sys_devops_repository (
    id              BIGINT       NOT NULL,
    repo_no         VARCHAR(64)  NOT NULL,
    repo_code       VARCHAR(64)  NOT NULL,
    repo_name       VARCHAR(200) NOT NULL,
    repo_type       VARCHAR(16)  NOT NULL DEFAULT 'GIT',
    repo_url        VARCHAR(500),
    branch_strategy VARCHAR(32)  NOT NULL DEFAULT 'GITFLOW',
    system_domain   VARCHAR(32),
    owner_name      VARCHAR(128),
    repo_status     VARCHAR(32)  NOT NULL DEFAULT 'ACTIVE',
    org_id          BIGINT,
    org_name        VARCHAR(128),
    description     VARCHAR(1000),
    remark          VARCHAR(500),
    created_by      BIGINT,
    created_at      TIMESTAMP,
    updated_by      BIGINT,
    updated_at      TIMESTAMP,
    deleted         INT          NOT NULL DEFAULT 0,
    version         INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_sys_devops_repository_no ON sys_devops_repository (repo_no);
CREATE UNIQUE INDEX uk_sys_devops_repository_code ON sys_devops_repository (repo_code);
CREATE INDEX idx_sys_devops_repository_status ON sys_devops_repository (repo_status);

-- ========== T012 流水线 ==========

CREATE TABLE sys_devops_pipeline (
    id              BIGINT       NOT NULL,
    pipeline_no     VARCHAR(64)  NOT NULL,
    pipeline_code   VARCHAR(64)  NOT NULL,
    pipeline_name   VARCHAR(200) NOT NULL,
    repo_code       VARCHAR(64),
    trigger_type    VARCHAR(32)  NOT NULL DEFAULT 'PUSH',
    pipeline_status VARCHAR(32)  NOT NULL DEFAULT 'ACTIVE',
    org_id          BIGINT,
    org_name        VARCHAR(128),
    description     VARCHAR(1000),
    remark          VARCHAR(500),
    created_by      BIGINT,
    created_at      TIMESTAMP,
    updated_by      BIGINT,
    updated_at      TIMESTAMP,
    deleted         INT          NOT NULL DEFAULT 0,
    version         INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_sys_devops_pipeline_no ON sys_devops_pipeline (pipeline_no);
CREATE UNIQUE INDEX uk_sys_devops_pipeline_code ON sys_devops_pipeline (pipeline_code);
CREATE INDEX idx_sys_devops_pipeline_repo ON sys_devops_pipeline (repo_code);
CREATE INDEX idx_sys_devops_pipeline_status ON sys_devops_pipeline (pipeline_status);

-- ========== T012 环境 ==========

CREATE TABLE sys_devops_environment (
    id            BIGINT       NOT NULL,
    env_no        VARCHAR(64)  NOT NULL,
    env_code      VARCHAR(64)  NOT NULL,
    env_name      VARCHAR(200) NOT NULL,
    env_type      VARCHAR(16)  NOT NULL DEFAULT 'DEV',
    deploy_target VARCHAR(200),
    isolated      INT          NOT NULL DEFAULT 1,
    owner_name    VARCHAR(128),
    env_status    VARCHAR(32)  NOT NULL DEFAULT 'ACTIVE',
    org_id        BIGINT,
    org_name      VARCHAR(128),
    description   VARCHAR(1000),
    remark        VARCHAR(500),
    created_by    BIGINT,
    created_at    TIMESTAMP,
    updated_by    BIGINT,
    updated_at    TIMESTAMP,
    deleted       INT          NOT NULL DEFAULT 0,
    version       INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_sys_devops_environment_no ON sys_devops_environment (env_no);
CREATE UNIQUE INDEX uk_sys_devops_environment_code ON sys_devops_environment (env_code);
CREATE INDEX idx_sys_devops_environment_type ON sys_devops_environment (env_type);
CREATE INDEX idx_sys_devops_environment_status ON sys_devops_environment (env_status);

-- ========== T012 构建部署记录 ==========

CREATE TABLE sys_devops_build_run (
    id            BIGINT       NOT NULL,
    run_no        VARCHAR(64)  NOT NULL,
    pipeline_code VARCHAR(64)  NOT NULL,
    build_no      VARCHAR(64),
    env_code      VARCHAR(64),
    commit_id     VARCHAR(64),
    build_status  VARCHAR(32)  NOT NULL DEFAULT 'RUNNING',
    start_time    TIMESTAMP,
    end_time      TIMESTAMP,
    duration_ms   BIGINT,
    artifact_ref  VARCHAR(500),
    message       VARCHAR(1000),
    org_id        BIGINT,
    org_name      VARCHAR(128),
    description   VARCHAR(1000),
    remark        VARCHAR(500),
    created_by    BIGINT,
    created_at    TIMESTAMP,
    updated_by    BIGINT,
    updated_at    TIMESTAMP,
    deleted       INT          NOT NULL DEFAULT 0,
    version       INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_sys_devops_build_run_no ON sys_devops_build_run (run_no);
CREATE INDEX idx_sys_devops_build_run_pipeline ON sys_devops_build_run (pipeline_code);
CREATE INDEX idx_sys_devops_build_run_status ON sys_devops_build_run (build_status);

-- ========== T012 质量与安全门禁 ==========

CREATE TABLE sys_devops_gate (
    id            BIGINT       NOT NULL,
    gate_no       VARCHAR(64)  NOT NULL,
    pipeline_code VARCHAR(64)  NOT NULL,
    run_no        VARCHAR(64),
    gate_name     VARCHAR(200) NOT NULL,
    gate_type     VARCHAR(32)  NOT NULL DEFAULT 'UNIT_TEST',
    threshold_expr VARCHAR(200),
    issue_count   INT          NOT NULL DEFAULT 0,
    severity      VARCHAR(16),
    gate_result   VARCHAR(16)  NOT NULL DEFAULT 'PASS',
    check_time    TIMESTAMP,
    org_id        BIGINT,
    org_name      VARCHAR(128),
    description   VARCHAR(1000),
    remark        VARCHAR(500),
    created_by    BIGINT,
    created_at    TIMESTAMP,
    updated_by    BIGINT,
    updated_at    TIMESTAMP,
    deleted       INT          NOT NULL DEFAULT 0,
    version       INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_sys_devops_gate_no ON sys_devops_gate (gate_no);
CREATE INDEX idx_sys_devops_gate_pipeline ON sys_devops_gate (pipeline_code);
CREATE INDEX idx_sys_devops_gate_type ON sys_devops_gate (gate_type);
CREATE INDEX idx_sys_devops_gate_result ON sys_devops_gate (gate_result);
