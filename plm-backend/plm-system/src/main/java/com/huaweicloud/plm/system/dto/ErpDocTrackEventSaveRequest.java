package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 业务事件保存请求（对应 WBS G3-N7a ERP 业务单据追踪）。
 */
@Data
public class ErpDocTrackEventSaveRequest {

    /** 追溯号（业务追溯号，由用户填写）。 */
    private String traceNo;

    /** 行号。 */
    private Integer lineNo;

    /** 事件类型，为空默认 STATUS_CHANGE。 */
    private String eventType;

    /** 事件名称。 */
    private String eventName;

    /** 事件发生时间。 */
    private LocalDateTime eventTime;

    /** 操作人名称。 */
    private String operatorName;

    /** 事件状态，为空默认 DONE。 */
    private String eventStatus;

    /** 事件明细。 */
    private String eventDetail;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
