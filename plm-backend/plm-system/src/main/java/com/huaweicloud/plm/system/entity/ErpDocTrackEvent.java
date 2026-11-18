package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * ERP 业务单据追踪—业务事件（对应 WBS G3-N7a ERP 业务单据追踪）：
 * 记录追溯号下的行号、事件类型/名称、发生时间与操作人、事件状态与明细，支撑单据事件流水追溯。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_doc_track_event")
public class ErpDocTrackEvent extends BaseEntity {

    /** 追溯号（业务追溯号，由用户填写）。 */
    private String traceNo;

    /** 行号。 */
    private Integer lineNo;

    /** 事件类型，默认 STATUS_CHANGE。 */
    private String eventType;

    /** 事件名称。 */
    private String eventName;

    /** 事件发生时间。 */
    private LocalDateTime eventTime;

    /** 操作人名称。 */
    private String operatorName;

    /** 事件状态，默认 DONE。 */
    private String eventStatus;

    /** 事件明细。 */
    private String eventDetail;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
