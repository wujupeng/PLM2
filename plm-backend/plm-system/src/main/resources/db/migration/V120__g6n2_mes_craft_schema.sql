-- G6-N2 MES—工艺与作业（WBS T038）表结构。
-- 主数据权责：MES 为工艺版本、SOP、参数配方、首件确认、换线换型的执行权威源；
-- 工艺/配方引用 PLM 工艺主数据（G2），物料编码引用 PLM 物料主数据（G1-N8）。
-- 覆盖范围：工艺版本、SOP、参数配方、首件确认、换线换型。

-- ========== 1. 工艺版本 ==========

CREATE TABLE mes_process_version (
    id                  BIGINT        NOT NULL,
    process_version_no  VARCHAR(64)   NOT NULL,
    process_code        VARCHAR(64),
    process_name        VARCHAR(200),
    version_no          VARCHAR(32),
    material_code       VARCHAR(64)   NOT NULL,
    material_name       VARCHAR(200),
    spec                VARCHAR(200),
    route_code          VARCHAR(64),
    route_name          VARCHAR(200),
    effective_date      TIMESTAMP,
    expire_date         TIMESTAMP,
    version_status      VARCHAR(32)   NOT NULL DEFAULT 'DRAFT',
    approver            VARCHAR(64),
    approve_time        TIMESTAMP,
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
CREATE UNIQUE INDEX uk_mes_process_version_no ON mes_process_version (process_version_no);
CREATE INDEX idx_mes_process_version_process ON mes_process_version (process_code);
CREATE INDEX idx_mes_process_version_material ON mes_process_version (material_code);
CREATE INDEX idx_mes_process_version_status ON mes_process_version (version_status);

-- ========== 2. SOP 作业指导书 ==========

CREATE TABLE mes_sop (
    id             BIGINT        NOT NULL,
    sop_no         VARCHAR(64)   NOT NULL,
    sop_name       VARCHAR(200),
    process_code   VARCHAR(64),
    material_code  VARCHAR(64)   NOT NULL,
    material_name  VARCHAR(200),
    spec           VARCHAR(200),
    sop_version    VARCHAR(32),
    file_name      VARCHAR(255),
    file_url       VARCHAR(500),
    effective_date TIMESTAMP,
    sop_status     VARCHAR(32)   NOT NULL DEFAULT 'DRAFT',
    author         VARCHAR(64),
    publish_time   TIMESTAMP,
    org_id         BIGINT,
    org_name       VARCHAR(128),
    description    VARCHAR(1000),
    remark         VARCHAR(500),
    created_by     BIGINT,
    created_at     TIMESTAMP,
    updated_by     BIGINT,
    updated_at     TIMESTAMP,
    deleted        INT           NOT NULL DEFAULT 0,
    version        INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_mes_sop_no ON mes_sop (sop_no);
CREATE INDEX idx_mes_sop_process ON mes_sop (process_code);
CREATE INDEX idx_mes_sop_material ON mes_sop (material_code);
CREATE INDEX idx_mes_sop_status ON mes_sop (sop_status);

-- ========== 3. 参数配方 ==========

CREATE TABLE mes_recipe (
    id             BIGINT        NOT NULL,
    recipe_no      VARCHAR(64)   NOT NULL,
    recipe_name    VARCHAR(200),
    process_code   VARCHAR(64),
    material_code  VARCHAR(64)   NOT NULL,
    material_name  VARCHAR(200),
    spec           VARCHAR(200),
    param_code     VARCHAR(64),
    param_name     VARCHAR(200),
    param_value    VARCHAR(200),
    param_unit     VARCHAR(32),
    upper_limit    DECIMAL(18,4),
    lower_limit    DECIMAL(18,4),
    recipe_status  VARCHAR(32)   NOT NULL DEFAULT 'DRAFT',
    effective_date TIMESTAMP,
    org_id         BIGINT,
    org_name       VARCHAR(128),
    description    VARCHAR(1000),
    remark         VARCHAR(500),
    created_by     BIGINT,
    created_at     TIMESTAMP,
    updated_by     BIGINT,
    updated_at     TIMESTAMP,
    deleted        INT           NOT NULL DEFAULT 0,
    version        INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_mes_recipe_no ON mes_recipe (recipe_no);
CREATE INDEX idx_mes_recipe_process ON mes_recipe (process_code);
CREATE INDEX idx_mes_recipe_material ON mes_recipe (material_code);
CREATE INDEX idx_mes_recipe_status ON mes_recipe (recipe_status);

-- ========== 4. 首件确认 ==========

CREATE TABLE mes_fai (
    id             BIGINT        NOT NULL,
    fai_no         VARCHAR(64)   NOT NULL,
    work_order_no  VARCHAR(64),
    process_code   VARCHAR(64),
    material_code  VARCHAR(64)   NOT NULL,
    material_name  VARCHAR(200),
    spec           VARCHAR(200),
    equipment_code VARCHAR(64),
    inspector      VARCHAR(64),
    inspect_time   TIMESTAMP,
    fai_result     VARCHAR(32)   NOT NULL DEFAULT 'PASS',
    fai_status     VARCHAR(32)   NOT NULL DEFAULT 'PENDING',
    org_id         BIGINT,
    org_name       VARCHAR(128),
    description    VARCHAR(1000),
    remark         VARCHAR(500),
    created_by     BIGINT,
    created_at     TIMESTAMP,
    updated_by     BIGINT,
    updated_at     TIMESTAMP,
    deleted        INT           NOT NULL DEFAULT 0,
    version        INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_mes_fai_no ON mes_fai (fai_no);
CREATE INDEX idx_mes_fai_work_order ON mes_fai (work_order_no);
CREATE INDEX idx_mes_fai_material ON mes_fai (material_code);
CREATE INDEX idx_mes_fai_status ON mes_fai (fai_status);

-- ========== 5. 换线换型 ==========

CREATE TABLE mes_changeover (
    id                 BIGINT        NOT NULL,
    changeover_no      VARCHAR(64)   NOT NULL,
    work_order_no      VARCHAR(64),
    line_code          VARCHAR(64),
    material_code      VARCHAR(64)   NOT NULL,
    material_name      VARCHAR(200),
    changeover_type    VARCHAR(32)   NOT NULL DEFAULT 'MODEL',
    start_time         TIMESTAMP,
    end_time           TIMESTAMP,
    duration_minutes   DECIMAL(18,4) NOT NULL DEFAULT 0,
    changeover_status  VARCHAR(32)   NOT NULL DEFAULT 'DRAFT',
    operator           VARCHAR(64),
    org_id             BIGINT,
    org_name           VARCHAR(128),
    description        VARCHAR(1000),
    remark             VARCHAR(500),
    created_by         BIGINT,
    created_at         TIMESTAMP,
    updated_by         BIGINT,
    updated_at         TIMESTAMP,
    deleted            INT           NOT NULL DEFAULT 0,
    version            INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_mes_changeover_no ON mes_changeover (changeover_no);
CREATE INDEX idx_mes_changeover_work_order ON mes_changeover (work_order_no);
CREATE INDEX idx_mes_changeover_line ON mes_changeover (line_code);
CREATE INDEX idx_mes_changeover_material ON mes_changeover (material_code);
CREATE INDEX idx_mes_changeover_status ON mes_changeover (changeover_status);
