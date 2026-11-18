package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 业务事件分页查询条件（对应 WBS G3-N7a ERP 业务单据追踪）。
 * keyword 匹配 traceNo/eventName/operatorName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpDocTrackEventQuery extends PageQuery {

    /** 追溯号。 */
    private String traceNo;

    /** 事件类型。 */
    private String eventType;

    /** 事件状态。 */
    private String eventStatus;
}
