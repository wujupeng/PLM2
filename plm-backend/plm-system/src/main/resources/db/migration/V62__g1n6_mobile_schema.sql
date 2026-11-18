-- G1-N6 公共平台底座—通用能力（对应总任务书 WBS T106，公共能力，服务 G1-G8 全部系统）：
-- 移动端与PDA：扫码收货、上架、盘点、拣料、报工、标签校验和异常处理。
-- 说明：SQL 同时兼容 PostgreSQL 与 H2（PostgreSQL 兼容模式），主键由应用侧雪花算法生成。
-- 设计原则：
--   1) PDA 设备（mobile device）登记设备编号、类型（PDA/PHONE/SCANNER/TABLET）、型号、
--      绑定用户与运行状态（ACTIVE 在线/OFFLINE 离线/DISABLED 停用）及最近活跃时间，
--      为移动端鉴权、离线同步与设备级审计提供基础。
--   2) 移动场景（mobile scene）登记扫码作业场景（RECEIVE 收货/SHELVE 上架/STOCKTAKE 盘点/
--      PICK 拣料/REPORT 报工/LABEL_CHECK 标签校验），配置所属业务模块、是否支持离线及排序，
--      由平台统一维护场景清单，各业务系统按场景编码接入。
--   3) 扫码操作日志（mobile scan log）逐次记录扫码动作：场景、条码、业务键、关联单据、
--      操作人、设备、扫码时间与扫码结果（SUCCESS/FAIL），用于移动作业溯源与异常定位。
--   4) 标签校验规则（label rule）登记条码标签类型（MATERIAL 物料/PRODUCT 产品/BOX 箱码/
--      WAREHOUSE 库位）与校验类型（FORMAT 格式/CHECKSUM 校验位/LENGTH 长度/PREFIX 前缀）、
--      期望长度与异常级别，供移动端扫码时统一校验条码合法性（如 14 位零件号、28 位追溯码）。
--   5) 移动异常队列（mobile exception）承接扫码失败、标签非法、离线同步失败、权限不足、
--      数据不一致等移动端异常，记录场景、条码、异常类型与处理状态（OPEN/HANDLING/RESOLVED/IGNORED），
--      由现场人员在队列中处理，避免移动端异常在各系统间丢失。
-- 注意：
--   a) 业务字段一律不得命名为 version，避免与 BaseEntity 的乐观锁字段 version 冲突。
--   b) 各表主编码/唯一键存在硬唯一索引；为与唯一索引保持一致，本模块删除语义为「释放编码」，
--      由服务层执行物理删除（与 G1-N1 及其后各节点同一处理方式）。

-- ========== PDA 设备（T106） ==========

CREATE TABLE sys_mobile_device (
    id               BIGINT       NOT NULL,
    device_no        VARCHAR(64)  NOT NULL,
    device_name      VARCHAR(128) NOT NULL,
    device_type      VARCHAR(32)  NOT NULL DEFAULT 'PDA',
    device_model     VARCHAR(128),
    device_status    VARCHAR(32)  NOT NULL DEFAULT 'ACTIVE',
    bind_user_id     BIGINT,
    bind_user_name   VARCHAR(128),
    last_active_time TIMESTAMP,
    org_id           BIGINT,
    org_name         VARCHAR(128),
    description      VARCHAR(1000),
    remark           VARCHAR(500),
    created_by       BIGINT,
    created_at       TIMESTAMP,
    updated_by       BIGINT,
    updated_at       TIMESTAMP,
    deleted          INT          NOT NULL DEFAULT 0,
    version          INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_sys_mobile_device_no ON sys_mobile_device (device_no);
CREATE INDEX idx_sys_mobile_device_type ON sys_mobile_device (device_type);
CREATE INDEX idx_sys_mobile_device_status ON sys_mobile_device (device_status);

-- ========== 移动场景（T106） ==========

CREATE TABLE sys_mobile_scene (
    id             BIGINT       NOT NULL,
    scene_no       VARCHAR(64)  NOT NULL,
    scene_code     VARCHAR(64)  NOT NULL,
    scene_name     VARCHAR(128) NOT NULL,
    scan_type      VARCHAR(32)  NOT NULL DEFAULT 'RECEIVE',
    biz_module     VARCHAR(32),
    require_offline INT         NOT NULL DEFAULT 0,
    sort_no        INT          NOT NULL DEFAULT 1,
    scene_status   VARCHAR(32)  NOT NULL DEFAULT 'ACTIVE',
    org_id         BIGINT,
    org_name       VARCHAR(128),
    description    VARCHAR(1000),
    remark         VARCHAR(500),
    created_by     BIGINT,
    created_at     TIMESTAMP,
    updated_by     BIGINT,
    updated_at     TIMESTAMP,
    deleted        INT          NOT NULL DEFAULT 0,
    version        INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_sys_mobile_scene_no ON sys_mobile_scene (scene_no);
CREATE UNIQUE INDEX uk_sys_mobile_scene_code ON sys_mobile_scene (scene_code);
CREATE INDEX idx_sys_mobile_scene_type ON sys_mobile_scene (scan_type);
CREATE INDEX idx_sys_mobile_scene_status ON sys_mobile_scene (scene_status);

-- ========== 扫码操作日志（T106） ==========

CREATE TABLE sys_mobile_scan_log (
    id            BIGINT       NOT NULL,
    log_no        VARCHAR(64)  NOT NULL,
    scene_code    VARCHAR(64),
    scan_type     VARCHAR(32),
    barcode       VARCHAR(256) NOT NULL,
    biz_key       VARCHAR(128),
    doc_no        VARCHAR(64),
    operator_id   BIGINT,
    operator_name VARCHAR(128),
    device_no     VARCHAR(64),
    scan_time     TIMESTAMP,
    scan_result   VARCHAR(16)  NOT NULL DEFAULT 'SUCCESS',
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
CREATE UNIQUE INDEX uk_sys_mobile_scan_log_no ON sys_mobile_scan_log (log_no);
CREATE INDEX idx_sys_mobile_scan_log_scene ON sys_mobile_scan_log (scene_code);
CREATE INDEX idx_sys_mobile_scan_log_barcode ON sys_mobile_scan_log (barcode);
CREATE INDEX idx_sys_mobile_scan_log_result ON sys_mobile_scan_log (scan_result);

-- ========== 标签校验规则（T106） ==========

CREATE TABLE sys_label_rule (
    id               BIGINT       NOT NULL,
    rule_no          VARCHAR(64)  NOT NULL,
    rule_code        VARCHAR(64),
    rule_name        VARCHAR(128) NOT NULL,
    label_type       VARCHAR(32)  NOT NULL DEFAULT 'MATERIAL',
    check_type       VARCHAR(32)  NOT NULL DEFAULT 'FORMAT',
    barcode_pattern  VARCHAR(500),
    expected_length  INT,
    error_level      VARCHAR(16)  NOT NULL DEFAULT 'ERROR',
    rule_status      VARCHAR(32)  NOT NULL DEFAULT 'ACTIVE',
    org_id           BIGINT,
    org_name         VARCHAR(128),
    description      VARCHAR(1000),
    remark           VARCHAR(500),
    created_by       BIGINT,
    created_at       TIMESTAMP,
    updated_by       BIGINT,
    updated_at       TIMESTAMP,
    deleted          INT          NOT NULL DEFAULT 0,
    version          INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_sys_label_rule_no ON sys_label_rule (rule_no);
CREATE INDEX idx_sys_label_rule_type ON sys_label_rule (label_type);
CREATE INDEX idx_sys_label_rule_status ON sys_label_rule (rule_status);

-- ========== 移动异常队列（T106） ==========

CREATE TABLE sys_mobile_exception (
    id               BIGINT        NOT NULL,
    exception_no     VARCHAR(64)   NOT NULL,
    scene_code       VARCHAR(64),
    barcode          VARCHAR(256),
    error_type       VARCHAR(32)   NOT NULL DEFAULT 'SCAN_FAIL',
    error_message    VARCHAR(1000),
    exception_status VARCHAR(32)   NOT NULL DEFAULT 'OPEN',
    handler_name     VARCHAR(128),
    handled_time     TIMESTAMP,
    handle_note      VARCHAR(1000),
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
CREATE UNIQUE INDEX uk_sys_mobile_exception_no ON sys_mobile_exception (exception_no);
CREATE INDEX idx_sys_mobile_exception_scene ON sys_mobile_exception (scene_code);
CREATE INDEX idx_sys_mobile_exception_type ON sys_mobile_exception (error_type);
CREATE INDEX idx_sys_mobile_exception_status ON sys_mobile_exception (exception_status);
