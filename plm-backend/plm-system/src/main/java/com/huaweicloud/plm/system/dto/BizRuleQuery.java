package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 业务规则定义分页查询条件（G1-N6 WBS T104 业务规则引擎）。
 * startDate/endDate 作用于创建时间。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class BizRuleQuery extends PageQuery {

    /** 规则编码。 */
    private String ruleCode;

    /** 规则名称。 */
    private String ruleName;

    /** 规则类型：LEAD_TIME/MOQ/LOT_SIZE/SUBSTITUTE/FIFO/QUALITY_RELEASE/CREDIT_LIMIT。 */
    private String ruleType;

    /** 业务模块：PLM/ERP/SRM/MES/WMS/OA。 */
    private String bizModule;

    /** 规则状态：ACTIVE/DISABLED。 */
    private String ruleStatus;

    /** 起始日期（yyyy-MM-dd），作用于创建时间。 */
    private String startDate;

    /** 结束日期（yyyy-MM-dd），作用于创建时间。 */
    private String endDate;
}
