-- OA-N4 内部邮件与统一消息中心：邮件文件夹、邮件、收件关系、邮件附件、站内通知、通知模板
-- 说明：SQL 同时兼容 PostgreSQL 与 H2（PostgreSQL 兼容模式），主键由应用侧雪花算法生成。
-- 设计原则：文件夹、通知类型、通知渠道、模板均为可配置数据；邮件与通知均为用户维度数据，权限在服务层按收发关系校验。
-- 注意：业务字段一律不得命名为 version，避免与 BaseEntity 的乐观锁字段 version 冲突。

-- ========== 邮件文件夹（系统文件夹 + 自定义文件夹，按用户） ==========

CREATE TABLE oa_mail_folder (
    id            BIGINT       NOT NULL,
    folder_code   VARCHAR(64)  NOT NULL,
    folder_name   VARCHAR(128) NOT NULL,
    folder_type   VARCHAR(32)  NOT NULL DEFAULT 'CUSTOM',
    owner_user_id BIGINT       NOT NULL,
    sort_no       INT          NOT NULL DEFAULT 0,
    status        VARCHAR(32)  NOT NULL DEFAULT 'enabled',
    remark        VARCHAR(255),
    created_by    BIGINT,
    created_at    TIMESTAMP,
    updated_by    BIGINT,
    updated_at    TIMESTAMP,
    deleted       INT          NOT NULL DEFAULT 0,
    version       INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
-- 说明：文件夹采用逻辑删除后重建的方式，故使用普通索引而非唯一索引，避免逻辑删除残留行与唯一约束冲突。
CREATE INDEX idx_oa_mail_folder_owner ON oa_mail_folder (owner_user_id, folder_code);

-- ========== 邮件主表（发件人维度：草稿、已发送、星标、删除状态） ==========

CREATE TABLE oa_mail_message (
    id                  BIGINT       NOT NULL,
    message_no          VARCHAR(64)  NOT NULL,
    subject             VARCHAR(256) NOT NULL,
    content             TEXT,
    priority            VARCHAR(32)  NOT NULL DEFAULT 'NORMAL',
    sender_user_id      BIGINT       NOT NULL,
    sender_name         VARCHAR(64),
    sender_dept         VARCHAR(128),
    message_status      VARCHAR(32)  NOT NULL DEFAULT 'SENT',
    has_attachment      INT          NOT NULL DEFAULT 0,
    sender_star_flag    INT          NOT NULL DEFAULT 0,
    sender_deleted_flag INT          NOT NULL DEFAULT 0,
    parent_message_id   BIGINT,
    send_type           VARCHAR(32)  NOT NULL DEFAULT 'NEW',
    sent_at             TIMESTAMP,
    remark              VARCHAR(255),
    created_by          BIGINT,
    created_at          TIMESTAMP,
    updated_by          BIGINT,
    updated_at          TIMESTAMP,
    deleted             INT          NOT NULL DEFAULT 0,
    version             INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_oa_mail_message_no ON oa_mail_message (message_no);
CREATE INDEX idx_oa_mail_message_sender ON oa_mail_message (sender_user_id, message_status);
CREATE INDEX idx_oa_mail_message_sent_at ON oa_mail_message (sent_at);

-- ========== 收件关系（收件人维度：读、星标、删除、所属文件夹） ==========

CREATE TABLE oa_mail_recipient (
    id                BIGINT      NOT NULL,
    message_id        BIGINT      NOT NULL,
    recipient_user_id BIGINT      NOT NULL,
    recipient_name    VARCHAR(64),
    recipient_type    VARCHAR(32) NOT NULL DEFAULT 'TO',
    read_flag         INT         NOT NULL DEFAULT 0,
    read_at           TIMESTAMP,
    star_flag         INT         NOT NULL DEFAULT 0,
    deleted_flag      INT         NOT NULL DEFAULT 0,
    -- 所属文件夹：INBOX/TRASH 或自定义文件夹编码；草稿态收件关系为 NULL，发送后才落入收件箱。
    folder_code       VARCHAR(64),
    remark            VARCHAR(255),
    created_by        BIGINT,
    created_at        TIMESTAMP,
    updated_by        BIGINT,
    updated_at        TIMESTAMP,
    deleted           INT         NOT NULL DEFAULT 0,
    version           INT         NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE INDEX idx_oa_mail_recipient_user ON oa_mail_recipient (recipient_user_id, folder_code);
CREATE INDEX idx_oa_mail_recipient_message ON oa_mail_recipient (message_id);

-- ========== 邮件附件（先上传后关联，文件按 SHA-256 去重） ==========

CREATE TABLE oa_mail_attachment (
    id                  BIGINT       NOT NULL,
    message_id          BIGINT,
    file_name           VARCHAR(255) NOT NULL,
    file_size           BIGINT       NOT NULL DEFAULT 0,
    content_type        VARCHAR(128),
    file_hash           VARCHAR(128),
    storage_path        VARCHAR(500),
    scan_status         VARCHAR(32)  NOT NULL DEFAULT 'PENDING',
    scan_at             TIMESTAMP,
    uploaded_by_user_id BIGINT,
    remark              VARCHAR(255),
    created_by          BIGINT,
    created_at          TIMESTAMP,
    updated_by          BIGINT,
    updated_at          TIMESTAMP,
    deleted             INT          NOT NULL DEFAULT 0,
    version             INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE INDEX idx_oa_mail_attachment_message ON oa_mail_attachment (message_id);
CREATE INDEX idx_oa_mail_attachment_hash ON oa_mail_attachment (file_hash);

-- ========== 站内通知（统一消息中心） ==========

CREATE TABLE oa_notification (
    id               BIGINT       NOT NULL,
    notification_no  VARCHAR(64)  NOT NULL,
    receiver_user_id BIGINT       NOT NULL,
    receiver_name    VARCHAR(64),
    message_type     VARCHAR(32)  NOT NULL DEFAULT 'SYSTEM',
    title            VARCHAR(256) NOT NULL,
    content          TEXT,
    biz_type         VARCHAR(64),
    biz_id           BIGINT,
    biz_no           VARCHAR(64),
    link_url         VARCHAR(500),
    priority         VARCHAR(32)  NOT NULL DEFAULT 'NORMAL',
    read_flag        INT          NOT NULL DEFAULT 0,
    read_at          TIMESTAMP,
    archived_flag    INT          NOT NULL DEFAULT 0,
    template_code    VARCHAR(64),
    channel          VARCHAR(32)  NOT NULL DEFAULT 'STATION',
    send_status      VARCHAR(32)  NOT NULL DEFAULT 'SENT',
    sent_at          TIMESTAMP,
    remark           VARCHAR(255),
    created_by       BIGINT,
    created_at       TIMESTAMP,
    updated_by       BIGINT,
    updated_at       TIMESTAMP,
    deleted          INT          NOT NULL DEFAULT 0,
    version          INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_oa_notification_no ON oa_notification (notification_no);
CREATE INDEX idx_oa_notification_receiver ON oa_notification (receiver_user_id, read_flag);
CREATE INDEX idx_oa_notification_type ON oa_notification (message_type);
CREATE INDEX idx_oa_notification_biz ON oa_notification (biz_type, biz_id);

-- ========== 通知模板（渠道与文案均可配置） ==========

CREATE TABLE oa_notify_template (
    id               BIGINT       NOT NULL,
    template_code    VARCHAR(64)  NOT NULL,
    template_name    VARCHAR(128) NOT NULL,
    message_type     VARCHAR(32)  NOT NULL DEFAULT 'SYSTEM',
    channel          VARCHAR(32)  NOT NULL DEFAULT 'STATION',
    title_template   VARCHAR(256),
    content_template TEXT,
    variable_json    TEXT,
    status           VARCHAR(32)  NOT NULL DEFAULT 'enabled',
    remark           VARCHAR(255),
    created_by       BIGINT,
    created_at       TIMESTAMP,
    updated_by       BIGINT,
    updated_at       TIMESTAMP,
    deleted          INT          NOT NULL DEFAULT 0,
    version          INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
-- 说明：模板编码采用逻辑删除后重建的方式，唯一性由服务层校验，故使用普通索引。
CREATE INDEX idx_oa_notify_template_code ON oa_notify_template (template_code);
CREATE INDEX idx_oa_notify_template_type ON oa_notify_template (message_type);
