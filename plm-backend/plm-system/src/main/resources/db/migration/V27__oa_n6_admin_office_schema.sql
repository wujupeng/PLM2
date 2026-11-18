-- OA-N6 通用行政人事与办公应用：行政人事流程包、会议与日程、协同办公、通讯录与移动端配置
-- 说明：SQL 同时兼容 PostgreSQL 与 H2（PostgreSQL 兼容模式），主键由应用侧雪花算法生成。
-- 设计原则：
--   1) 审批路径统一由 OA-N3 低代码工作流引擎承载，业务单据通过 instance_id / instance_no 关联流程实例，
--      审批完成后由引擎事件驱动回写业务单据状态（见 WorkflowEngineService 发布的工作流事件）。
--   2) 请假类型、加班类型、访客状态、公告范围等全部为可配置字典；额度/时限/开关类规则为可配置项。
--   3) 考勤原始打卡事实由权威考勤源提供，本模块仅承载异常申请与处理结果，不篡改原始打卡数据。
-- 注意：业务字段一律不得命名为 version，避免与 BaseEntity 的乐观锁字段 version 冲突。

-- ========== 请假单（OA-DEV-054） ==========

CREATE TABLE oa_hr_leave (
    id                BIGINT       NOT NULL,
    leave_no          VARCHAR(64)  NOT NULL,
    applicant_user_id BIGINT       NOT NULL,
    applicant_name    VARCHAR(64),
    org_id            BIGINT,
    org_name          VARCHAR(128),
    leave_type        VARCHAR(32)  NOT NULL DEFAULT 'PERSONAL',
    start_time        TIMESTAMP,
    end_time          TIMESTAMP,
    leave_days        DECIMAL(12,2),
    reason            VARCHAR(500),
    attachment_json   TEXT,
    flow_status       VARCHAR(32)  NOT NULL DEFAULT 'DRAFT',
    instance_id       BIGINT,
    instance_no       VARCHAR(64),
    cancel_flag       INT          NOT NULL DEFAULT 0,
    make_up_flag      INT          NOT NULL DEFAULT 0,
    remark            VARCHAR(255),
    created_by        BIGINT,
    created_at        TIMESTAMP,
    updated_by        BIGINT,
    updated_at        TIMESTAMP,
    deleted           INT          NOT NULL DEFAULT 0,
    version           INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_oa_hr_leave_no ON oa_hr_leave (leave_no);
CREATE INDEX idx_oa_hr_leave_applicant ON oa_hr_leave (applicant_user_id);
CREATE INDEX idx_oa_hr_leave_status ON oa_hr_leave (flow_status);

-- ========== 加班单（OA-DEV-054） ==========

CREATE TABLE oa_hr_overtime (
    id                BIGINT       NOT NULL,
    overtime_no       VARCHAR(64)  NOT NULL,
    applicant_user_id BIGINT       NOT NULL,
    applicant_name    VARCHAR(64),
    org_id            BIGINT,
    org_name          VARCHAR(128),
    overtime_type     VARCHAR(32)  NOT NULL DEFAULT 'WORKDAY',
    start_time        TIMESTAMP,
    end_time          TIMESTAMP,
    overtime_hours    DECIMAL(12,2),
    compensate_type   VARCHAR(32)  NOT NULL DEFAULT 'COMPENSATORY',
    reason            VARCHAR(500),
    attachment_json   TEXT,
    flow_status       VARCHAR(32)  NOT NULL DEFAULT 'DRAFT',
    instance_id       BIGINT,
    instance_no       VARCHAR(64),
    cancel_flag       INT          NOT NULL DEFAULT 0,
    remark            VARCHAR(255),
    created_by        BIGINT,
    created_at        TIMESTAMP,
    updated_by        BIGINT,
    updated_at        TIMESTAMP,
    deleted           INT          NOT NULL DEFAULT 0,
    version           INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_oa_hr_overtime_no ON oa_hr_overtime (overtime_no);
CREATE INDEX idx_oa_hr_overtime_applicant ON oa_hr_overtime (applicant_user_id);
CREATE INDEX idx_oa_hr_overtime_status ON oa_hr_overtime (flow_status);

-- ========== 离职申请单（OA-DEV-055） ==========

CREATE TABLE oa_hr_resignation (
    id                  BIGINT       NOT NULL,
    resignation_no      VARCHAR(64)  NOT NULL,
    applicant_user_id   BIGINT       NOT NULL,
    applicant_name      VARCHAR(64),
    org_id              BIGINT,
    org_name            VARCHAR(128),
    position_name       VARCHAR(128),
    last_work_date      DATE,
    resignation_type    VARCHAR(32)  NOT NULL DEFAULT 'VOLUNTARY',
    reason              VARCHAR(500),
    handover_json       TEXT,
    handover_user_id    BIGINT,
    handover_user_name  VARCHAR(64),
    account_disable_flag INT         NOT NULL DEFAULT 1,
    account_disabled    INT          NOT NULL DEFAULT 0,
    flow_status         VARCHAR(32)  NOT NULL DEFAULT 'DRAFT',
    instance_id         BIGINT,
    instance_no         VARCHAR(64),
    cancel_flag         INT          NOT NULL DEFAULT 0,
    remark              VARCHAR(255),
    created_by          BIGINT,
    created_at          TIMESTAMP,
    updated_by          BIGINT,
    updated_at          TIMESTAMP,
    deleted             INT          NOT NULL DEFAULT 0,
    version             INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_oa_hr_resignation_no ON oa_hr_resignation (resignation_no);
CREATE INDEX idx_oa_hr_resignation_applicant ON oa_hr_resignation (applicant_user_id);
CREATE INDEX idx_oa_hr_resignation_status ON oa_hr_resignation (flow_status);

-- ========== 访客申请单（OA-DEV-056） ==========

CREATE TABLE oa_hr_visitor (
    id                BIGINT       NOT NULL,
    visitor_no        VARCHAR(64)  NOT NULL,
    visitor_name      VARCHAR(64)  NOT NULL,
    visitor_company   VARCHAR(128),
    visitor_phone     VARCHAR(32),
    visitor_count     INT          NOT NULL DEFAULT 1,
    visit_reason      VARCHAR(500),
    visit_area        VARCHAR(128),
    visit_start       TIMESTAMP,
    visit_end         TIMESTAMP,
    host_user_id      BIGINT,
    host_name         VARCHAR(64),
    applicant_user_id BIGINT,
    applicant_name    VARCHAR(64),
    org_id            BIGINT,
    vehicle_no        VARCHAR(32),
    flow_status       VARCHAR(32)  NOT NULL DEFAULT 'DRAFT',
    checkin_at        TIMESTAMP,
    checkout_at       TIMESTAMP,
    instance_id       BIGINT,
    instance_no       VARCHAR(64),
    cancel_flag       INT          NOT NULL DEFAULT 0,
    remark            VARCHAR(255),
    created_by        BIGINT,
    created_at        TIMESTAMP,
    updated_by        BIGINT,
    updated_at        TIMESTAMP,
    deleted           INT          NOT NULL DEFAULT 0,
    version           INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_oa_hr_visitor_no ON oa_hr_visitor (visitor_no);
CREATE INDEX idx_oa_hr_visitor_host ON oa_hr_visitor (host_user_id);
CREATE INDEX idx_oa_hr_visitor_status ON oa_hr_visitor (flow_status);

-- ========== 考勤异常处理单（OA-DEV-057） ==========

CREATE TABLE oa_hr_attendance_exception (
    id                BIGINT       NOT NULL,
    exception_no      VARCHAR(64)  NOT NULL,
    applicant_user_id BIGINT       NOT NULL,
    applicant_name    VARCHAR(64),
    org_id            BIGINT,
    org_name          VARCHAR(128),
    exception_type    VARCHAR(32)  NOT NULL DEFAULT 'OTHER',
    exception_date    DATE,
    exception_desc    VARCHAR(500),
    apply_reason      VARCHAR(500),
    attachment_json   TEXT,
    handle_result     VARCHAR(500),
    flow_status       VARCHAR(32)  NOT NULL DEFAULT 'DRAFT',
    instance_id       BIGINT,
    instance_no       VARCHAR(64),
    cancel_flag       INT          NOT NULL DEFAULT 0,
    remark            VARCHAR(255),
    created_by        BIGINT,
    created_at        TIMESTAMP,
    updated_by        BIGINT,
    updated_at        TIMESTAMP,
    deleted           INT          NOT NULL DEFAULT 0,
    version           INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_oa_hr_att_exception_no ON oa_hr_attendance_exception (exception_no);
CREATE INDEX idx_oa_hr_att_exception_applicant ON oa_hr_attendance_exception (applicant_user_id);
CREATE INDEX idx_oa_hr_att_exception_status ON oa_hr_attendance_exception (flow_status);

-- ========== 车辆档案（OA-DEV-058） ==========

CREATE TABLE oa_hr_vehicle (
    id             BIGINT       NOT NULL,
    vehicle_code   VARCHAR(64)  NOT NULL,
    plate_no       VARCHAR(32)  NOT NULL,
    vehicle_type   VARCHAR(32)  NOT NULL DEFAULT 'SEDAN',
    brand_model    VARCHAR(128),
    seat_count     INT,
    driver_user_id BIGINT,
    driver_name    VARCHAR(64),
    vehicle_status VARCHAR(32)  NOT NULL DEFAULT 'IDLE',
    remark         VARCHAR(255),
    created_by     BIGINT,
    created_at     TIMESTAMP,
    updated_by     BIGINT,
    updated_at     TIMESTAMP,
    deleted        INT          NOT NULL DEFAULT 0,
    version        INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_oa_hr_vehicle_code ON oa_hr_vehicle (vehicle_code);
CREATE INDEX idx_oa_hr_vehicle_plate ON oa_hr_vehicle (plate_no);

-- ========== 用车申请单（OA-DEV-058） ==========

CREATE TABLE oa_hr_vehicle_apply (
    id                BIGINT       NOT NULL,
    apply_no          VARCHAR(64)  NOT NULL,
    applicant_user_id BIGINT       NOT NULL,
    applicant_name    VARCHAR(64),
    org_id            BIGINT,
    org_name          VARCHAR(128),
    vehicle_id        BIGINT,
    plate_no          VARCHAR(32),
    driver_user_id    BIGINT,
    driver_name       VARCHAR(64),
    start_time        TIMESTAMP,
    end_time          TIMESTAMP,
    destination       VARCHAR(256),
    purpose           VARCHAR(500),
    passenger_count   INT          NOT NULL DEFAULT 1,
    mileage           DECIMAL(12,2),
    cost_amount       DECIMAL(12,2),
    flow_status       VARCHAR(32)  NOT NULL DEFAULT 'DRAFT',
    instance_id       BIGINT,
    instance_no       VARCHAR(64),
    cancel_flag       INT          NOT NULL DEFAULT 0,
    remark            VARCHAR(255),
    created_by        BIGINT,
    created_at        TIMESTAMP,
    updated_by        BIGINT,
    updated_at        TIMESTAMP,
    deleted           INT          NOT NULL DEFAULT 0,
    version           INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_oa_hr_vehicle_apply_no ON oa_hr_vehicle_apply (apply_no);
CREATE INDEX idx_oa_hr_vehicle_apply_applicant ON oa_hr_vehicle_apply (applicant_user_id);
CREATE INDEX idx_oa_hr_vehicle_apply_status ON oa_hr_vehicle_apply (flow_status);

-- ========== 会议室（OA-DEV-058） ==========

CREATE TABLE oa_hr_meeting_room (
    id          BIGINT       NOT NULL,
    room_code   VARCHAR(64)  NOT NULL,
    room_name   VARCHAR(128) NOT NULL,
    location    VARCHAR(256),
    capacity    INT,
    device_json TEXT,
    room_status VARCHAR(32)  NOT NULL DEFAULT 'ENABLED',
    manager_user_id BIGINT,
    manager_name    VARCHAR(64),
    remark      VARCHAR(255),
    created_by  BIGINT,
    created_at  TIMESTAMP,
    updated_by  BIGINT,
    updated_at  TIMESTAMP,
    deleted     INT          NOT NULL DEFAULT 0,
    version     INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_oa_hr_meeting_room_code ON oa_hr_meeting_room (room_code);

-- ========== 会议室预约单（OA-DEV-058） ==========

CREATE TABLE oa_hr_meeting_booking (
    id                BIGINT       NOT NULL,
    booking_no        VARCHAR(64)  NOT NULL,
    room_id           BIGINT       NOT NULL,
    room_name         VARCHAR(128),
    subject           VARCHAR(256) NOT NULL,
    organizer_user_id BIGINT       NOT NULL,
    organizer_name    VARCHAR(64),
    org_id            BIGINT,
    start_time        TIMESTAMP    NOT NULL,
    end_time          TIMESTAMP    NOT NULL,
    attendee_json     TEXT,
    attendee_count    INT          NOT NULL DEFAULT 0,
    booking_status    VARCHAR(32)  NOT NULL DEFAULT 'BOOKED',
    instance_id       BIGINT,
    instance_no       VARCHAR(64),
    remark            VARCHAR(255),
    created_by        BIGINT,
    created_at        TIMESTAMP,
    updated_by        BIGINT,
    updated_at        TIMESTAMP,
    deleted           INT          NOT NULL DEFAULT 0,
    version           INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_oa_hr_meeting_booking_no ON oa_hr_meeting_booking (booking_no);
CREATE INDEX idx_oa_hr_meeting_booking_room ON oa_hr_meeting_booking (room_id, start_time);
CREATE INDEX idx_oa_hr_meeting_booking_organizer ON oa_hr_meeting_booking (organizer_user_id);

-- ========== 个人/部门日程（OA-DEV-058） ==========

CREATE TABLE oa_oa_schedule (
    id                BIGINT       NOT NULL,
    schedule_no       VARCHAR(64)  NOT NULL,
    owner_user_id     BIGINT       NOT NULL,
    owner_name        VARCHAR(64),
    org_id            BIGINT,
    title             VARCHAR(256) NOT NULL,
    schedule_type     VARCHAR(32)  NOT NULL DEFAULT 'PERSONAL',
    start_time        TIMESTAMP    NOT NULL,
    end_time          TIMESTAMP,
    all_day_flag      INT          NOT NULL DEFAULT 0,
    location          VARCHAR(256),
    participant_json  TEXT,
    share_scope       VARCHAR(32)  NOT NULL DEFAULT 'PRIVATE',
    remind_minutes    INT,
    content           TEXT,
    schedule_status   VARCHAR(32)  NOT NULL DEFAULT 'ACTIVE',
    remark            VARCHAR(255),
    created_by        BIGINT,
    created_at        TIMESTAMP,
    updated_by        BIGINT,
    updated_at        TIMESTAMP,
    deleted           INT          NOT NULL DEFAULT 0,
    version           INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_oa_oa_schedule_no ON oa_oa_schedule (schedule_no);
CREATE INDEX idx_oa_oa_schedule_owner ON oa_oa_schedule (owner_user_id, start_time);

-- ========== 公告与新闻（OA-DEV-059） ==========

CREATE TABLE oa_oa_announcement (
    id                 BIGINT       NOT NULL,
    announcement_no    VARCHAR(64)  NOT NULL,
    title              VARCHAR(256) NOT NULL,
    category           VARCHAR(32)  NOT NULL DEFAULT 'ANNOUNCEMENT',
    content            TEXT,
    publish_scope      VARCHAR(32)  NOT NULL DEFAULT 'ALL',
    scope_value        VARCHAR(256),
    publish_status     VARCHAR(32)  NOT NULL DEFAULT 'DRAFT',
    publish_at         TIMESTAMP,
    expire_at          TIMESTAMP,
    need_read_flag     INT          NOT NULL DEFAULT 0,
    top_flag           INT          NOT NULL DEFAULT 0,
    view_count         INT          NOT NULL DEFAULT 0,
    author_user_id     BIGINT,
    author_name        VARCHAR(64),
    attachment_json    TEXT,
    remark             VARCHAR(255),
    created_by         BIGINT,
    created_at         TIMESTAMP,
    updated_by         BIGINT,
    updated_at         TIMESTAMP,
    deleted            INT          NOT NULL DEFAULT 0,
    version            INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_oa_oa_announcement_no ON oa_oa_announcement (announcement_no);
CREATE INDEX idx_oa_oa_announcement_status ON oa_oa_announcement (publish_status, category);

-- ========== 公告阅读确认（OA-DEV-059） ==========

CREATE TABLE oa_oa_announcement_read (
    id              BIGINT      NOT NULL,
    announcement_id BIGINT      NOT NULL,
    user_id         BIGINT      NOT NULL,
    user_name       VARCHAR(64),
    read_at         TIMESTAMP,
    created_by      BIGINT,
    created_at      TIMESTAMP,
    updated_by      BIGINT,
    updated_at      TIMESTAMP,
    deleted         INT         NOT NULL DEFAULT 0,
    version         INT         NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE INDEX idx_oa_oa_announcement_read_doc ON oa_oa_announcement_read (announcement_id);

-- ========== 投票调查（OA-DEV-059） ==========

CREATE TABLE oa_oa_vote (
    id               BIGINT       NOT NULL,
    vote_no          VARCHAR(64)  NOT NULL,
    title            VARCHAR(256) NOT NULL,
    description      VARCHAR(500),
    vote_type        VARCHAR(32)  NOT NULL DEFAULT 'SINGLE',
    anonymous_flag   INT          NOT NULL DEFAULT 0,
    max_choice       INT          NOT NULL DEFAULT 1,
    start_at         TIMESTAMP,
    end_at           TIMESTAMP,
    vote_status      VARCHAR(32)  NOT NULL DEFAULT 'DRAFT',
    publish_scope    VARCHAR(32)  NOT NULL DEFAULT 'ALL',
    scope_value      VARCHAR(256),
    creator_user_id  BIGINT,
    creator_name     VARCHAR(64),
    remark           VARCHAR(255),
    created_by       BIGINT,
    created_at       TIMESTAMP,
    updated_by       BIGINT,
    updated_at       TIMESTAMP,
    deleted          INT          NOT NULL DEFAULT 0,
    version          INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_oa_oa_vote_no ON oa_oa_vote (vote_no);

-- ========== 投票选项（OA-DEV-059） ==========

CREATE TABLE oa_oa_vote_option (
    id          BIGINT       NOT NULL,
    vote_id     BIGINT       NOT NULL,
    option_text VARCHAR(256) NOT NULL,
    vote_count  INT          NOT NULL DEFAULT 0,
    sort_no     INT          NOT NULL DEFAULT 0,
    remark      VARCHAR(255),
    created_by  BIGINT,
    created_at  TIMESTAMP,
    updated_by  BIGINT,
    updated_at  TIMESTAMP,
    deleted     INT          NOT NULL DEFAULT 0,
    version     INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE INDEX idx_oa_oa_vote_option_vote ON oa_oa_vote_option (vote_id);

-- ========== 投票记录（OA-DEV-059） ==========

CREATE TABLE oa_oa_vote_record (
    id            BIGINT      NOT NULL,
    vote_id       BIGINT      NOT NULL,
    option_id     BIGINT      NOT NULL,
    voter_user_id BIGINT,
    voter_name    VARCHAR(64),
    voted_at      TIMESTAMP,
    created_by    BIGINT,
    created_at    TIMESTAMP,
    updated_by    BIGINT,
    updated_at    TIMESTAMP,
    deleted       INT         NOT NULL DEFAULT 0,
    version       INT         NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE INDEX idx_oa_oa_vote_record_vote ON oa_oa_vote_record (vote_id);
CREATE INDEX idx_oa_oa_vote_record_voter ON oa_oa_vote_record (vote_id, voter_user_id);

-- ========== 相册（OA-DEV-059） ==========

CREATE TABLE oa_oa_album (
    id               BIGINT       NOT NULL,
    album_no         VARCHAR(64)  NOT NULL,
    album_name       VARCHAR(128) NOT NULL,
    category         VARCHAR(64),
    description      VARCHAR(500),
    cover_photo_id   BIGINT,
    publish_scope    VARCHAR(32)  NOT NULL DEFAULT 'ALL',
    scope_value      VARCHAR(256),
    album_status     VARCHAR(32)  NOT NULL DEFAULT 'DRAFT',
    photo_count      INT          NOT NULL DEFAULT 0,
    creator_user_id  BIGINT,
    creator_name     VARCHAR(64),
    remark           VARCHAR(255),
    created_by       BIGINT,
    created_at       TIMESTAMP,
    updated_by       BIGINT,
    updated_at       TIMESTAMP,
    deleted          INT          NOT NULL DEFAULT 0,
    version          INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_oa_oa_album_no ON oa_oa_album (album_no);

-- ========== 相册照片（OA-DEV-059） ==========

CREATE TABLE oa_oa_album_photo (
    id               BIGINT       NOT NULL,
    album_id         BIGINT       NOT NULL,
    file_id          BIGINT,
    file_name        VARCHAR(256),
    file_size        BIGINT,
    content_type     VARCHAR(128),
    file_path        VARCHAR(512),
    description      VARCHAR(500),
    sort_no          INT          NOT NULL DEFAULT 0,
    uploader_user_id BIGINT,
    uploader_name    VARCHAR(64),
    remark           VARCHAR(255),
    created_by       BIGINT,
    created_at       TIMESTAMP,
    updated_by       BIGINT,
    updated_at       TIMESTAMP,
    deleted          INT          NOT NULL DEFAULT 0,
    version          INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE INDEX idx_oa_oa_album_photo_album ON oa_oa_album_photo (album_id);

-- ========== 协作任务（OA-DEV-060） ==========

CREATE TABLE oa_oa_collab_task (
    id               BIGINT       NOT NULL,
    task_no          VARCHAR(64)  NOT NULL,
    title            VARCHAR(256) NOT NULL,
    content          TEXT,
    owner_user_id    BIGINT       NOT NULL,
    owner_name       VARCHAR(64),
    org_id           BIGINT,
    participant_json TEXT,
    priority         VARCHAR(32)  NOT NULL DEFAULT 'NORMAL',
    due_at           TIMESTAMP,
    progress         INT          NOT NULL DEFAULT 0,
    task_status      VARCHAR(32)  NOT NULL DEFAULT 'TODO',
    parent_id        BIGINT,
    remark           VARCHAR(255),
    created_by       BIGINT,
    created_at       TIMESTAMP,
    updated_by       BIGINT,
    updated_at       TIMESTAMP,
    deleted          INT          NOT NULL DEFAULT 0,
    version          INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_oa_oa_collab_task_no ON oa_oa_collab_task (task_no);
CREATE INDEX idx_oa_oa_collab_task_owner ON oa_oa_collab_task (owner_user_id, task_status);

-- ========== 协作评论（OA-DEV-060） ==========

CREATE TABLE oa_oa_collab_comment (
    id             BIGINT       NOT NULL,
    biz_type       VARCHAR(32)  NOT NULL,
    biz_id         BIGINT       NOT NULL,
    content        VARCHAR(1000),
    author_user_id BIGINT,
    author_name    VARCHAR(64),
    parent_id      BIGINT,
    remark         VARCHAR(255),
    created_by     BIGINT,
    created_at     TIMESTAMP,
    updated_by     BIGINT,
    updated_at     TIMESTAMP,
    deleted        INT          NOT NULL DEFAULT 0,
    version        INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE INDEX idx_oa_oa_collab_comment_biz ON oa_oa_collab_comment (biz_type, biz_id);

-- ========== 工作汇报（OA-DEV-060） ==========

CREATE TABLE oa_oa_work_report (
    id               BIGINT       NOT NULL,
    report_no        VARCHAR(64)  NOT NULL,
    report_type      VARCHAR(32)  NOT NULL DEFAULT 'DAILY',
    title            VARCHAR(256) NOT NULL,
    content          TEXT,
    reporter_user_id BIGINT       NOT NULL,
    reporter_name    VARCHAR(64),
    org_id           BIGINT,
    org_name         VARCHAR(128),
    report_date      DATE,
    receiver_user_id BIGINT,
    receiver_name    VARCHAR(64),
    attachment_json  TEXT,
    report_status    VARCHAR(32)  NOT NULL DEFAULT 'SUBMITTED',
    read_flag        INT          NOT NULL DEFAULT 0,
    read_at          TIMESTAMP,
    remark           VARCHAR(255),
    created_by       BIGINT,
    created_at       TIMESTAMP,
    updated_by       BIGINT,
    updated_at       TIMESTAMP,
    deleted          INT          NOT NULL DEFAULT 0,
    version          INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_oa_oa_work_report_no ON oa_oa_work_report (report_no);
CREATE INDEX idx_oa_oa_work_report_reporter ON oa_oa_work_report (reporter_user_id, report_date);
CREATE INDEX idx_oa_oa_work_report_receiver ON oa_oa_work_report (receiver_user_id);

-- ========== 移动端配置（OA-DEV-061） ==========

CREATE TABLE oa_mobile_config (
    id           BIGINT       NOT NULL,
    config_type  VARCHAR(32)  NOT NULL DEFAULT 'MENU',
    config_key   VARCHAR(64)  NOT NULL,
    config_name  VARCHAR(128) NOT NULL,
    config_value VARCHAR(512),
    icon         VARCHAR(64),
    sort_no      INT          NOT NULL DEFAULT 0,
    config_status VARCHAR(32) NOT NULL DEFAULT 'ENABLED',
    remark       VARCHAR(255),
    created_by   BIGINT,
    created_at   TIMESTAMP,
    updated_by   BIGINT,
    updated_at   TIMESTAMP,
    deleted      INT          NOT NULL DEFAULT 0,
    version      INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uk_oa_mobile_config_key ON oa_mobile_config (config_key);
CREATE INDEX idx_oa_mobile_config_type ON oa_mobile_config (config_type);
