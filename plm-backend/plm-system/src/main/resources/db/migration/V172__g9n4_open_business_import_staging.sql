-- G9-N4 T079: 原始未结业务导入暂存、逐行质量校验及审核追踪。
CREATE TABLE mig_open_business_import_row (
    id                  BIGINT        NOT NULL,
    batch_id            BIGINT        NOT NULL,
    batch_no            VARCHAR(64)   NOT NULL,
    source_no           VARCHAR(128)  NOT NULL,
    object_type         VARCHAR(32)   NOT NULL,
    source_file         VARCHAR(255),
    source_payload      TEXT          NOT NULL,
    row_status          VARCHAR(32)   NOT NULL DEFAULT 'INVALID',
    validation_message  VARCHAR(2000),
    reviewed_by         VARCHAR(64),
    reviewed_at         TIMESTAMP,
    review_comment      VARCHAR(1000),
    target_id           BIGINT,
    promoted_at         TIMESTAMP,
    created_by          BIGINT,
    created_at          TIMESTAMP,
    updated_by          BIGINT,
    updated_at          TIMESTAMP,
    deleted             INT           NOT NULL DEFAULT 0,
    version             INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);
CREATE INDEX idx_mig_open_business_import_source
    ON mig_open_business_import_row (batch_id, object_type, source_no);
CREATE INDEX idx_mig_open_business_import_status
    ON mig_open_business_import_row (batch_id, row_status, id);

-- T079 补齐原始迁移范围，并区分采购/销售在途及三类未结算单据。
INSERT INTO sys_dictionary (id, dict_type, dict_label, dict_value, sort_no, status, remark) VALUES
(9737, 'mig_open_business_object_type', '待检业务', 'PENDING_INSPECTION', 6, 1, NULL),
(9738, 'mig_open_business_object_type', '未结算业务', 'UNSETTLED', 7, 1, NULL),
(9739, 'mig_open_business_object_type', '采购在途', 'IN_TRANSIT_PURCHASE', 8, 1, NULL),
(9740, 'mig_open_business_object_type', '销售发运在途', 'IN_TRANSIT_SALES', 9, 1, NULL),
(9741, 'mig_open_business_object_type', '未结应收', 'UNSETTLED_AR', 10, 1, NULL),
(9742, 'mig_open_business_object_type', '未结应付', 'UNSETTLED_AP', 11, 1, NULL),
(9743, 'mig_open_business_object_type', '未结委外结算', 'UNSETTLED_OUTSOURCE', 12, 1, NULL),
(9744, 'mig_open_business_batch_status', '待审核', 'PENDING_REVIEW', 6, 1, NULL),
(9745, 'mig_open_business_import_row_status', '待审核', 'PENDING_REVIEW', 1, 1, NULL),
(9746, 'mig_open_business_import_row_status', '校验失败', 'INVALID', 2, 1, NULL),
(9747, 'mig_open_business_import_row_status', '已通过', 'APPROVED', 3, 1, NULL),
(9748, 'mig_open_business_import_row_status', '已驳回', 'REJECTED', 4, 1, NULL),
(9749, 'mig_open_business_import_row_status', '已转正式单据', 'PROMOTED', 5, 1, NULL),
(9750, 'mig_open_business_import_row_status', '转入失败可重试', 'PROMOTION_FAILED', 6, 1, NULL);
