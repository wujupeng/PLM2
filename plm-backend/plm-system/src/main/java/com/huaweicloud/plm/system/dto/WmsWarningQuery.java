package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 缺料预警分页查询条件。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class WmsWarningQuery extends PageQuery {

    /** 物料编码。 */
    private String materialCode;

    /** 产线。 */
    private String lineCode;

    /** 工单号。 */
    private String workOrderNo;

    /** 预警等级：L1/L2/L3/CRITICAL。 */
    private String warningLevel;

    /** 预警状态：OPEN/ACK/PROCESSING/CLOSED。 */
    private String warningStatus;
}
