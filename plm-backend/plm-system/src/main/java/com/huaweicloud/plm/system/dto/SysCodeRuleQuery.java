package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 编码规则分页查询条件（G1-N6 WBS T105 数据质量控制）。
 * startDate/endDate 作用于创建时间。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class SysCodeRuleQuery extends PageQuery {

    /** 编码规则编码。 */
    private String codeCode;

    /** 编码规则名称。 */
    private String codeName;

    /** 目标实体。 */
    private String targetEntity;

    /** 重置周期：NONE/DAILY/MONTHLY/YEARLY。 */
    private String resetCycle;

    /** 规则状态：ACTIVE/DISABLED。 */
    private String codeStatus;

    /** 起始日期（yyyy-MM-dd），作用于创建时间。 */
    private String startDate;

    /** 结束日期（yyyy-MM-dd），作用于创建时间。 */
    private String endDate;
}
