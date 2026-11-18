package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 会计期间分页查询条件（对应 WBS T028 会计科目与会计期间，属 G3-N6 ERP 财务）。
 * keyword 匹配 periodCode。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpFinancePeriodQuery extends PageQuery {

    /** 期间状态。 */
    private String periodStatus;

    /** 期间年度。 */
    private Integer periodYear;
}
