package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 召回单分页查询条件（N8，DEV-094）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class MfgRecallQuery extends PageQuery {

    /** 召回单号。 */
    private String recallNo;

    /** 召回类型：MATERIAL_BATCH/PRODUCTION_BATCH/CUSTOMER/DATE_RANGE。 */
    private String recallType;

    /** 召回状态：OPEN/ISOLATING/ISOLATED/CLOSED。 */
    private String recallStatus;

    /** 风险等级：LOW/MEDIUM/HIGH。 */
    private String riskLevel;

    /** 责任人。 */
    private String owner;
}
