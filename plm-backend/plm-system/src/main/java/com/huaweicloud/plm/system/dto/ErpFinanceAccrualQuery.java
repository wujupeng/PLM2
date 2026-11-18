package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 暂估分页查询条件（对应 WBS T028 ERP 财务，属 G3-N6 ERP 财务）。
 * keyword 匹配 accrualNo/sourceNo/partyName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpFinanceAccrualQuery extends PageQuery {

    /** 暂估类型。 */
    private String accrualType;

    /** 暂估状态。 */
    private String accrualStatus;

    /** 往来单位编码。 */
    private String partyCode;

    /** 会计期间编码。 */
    private String periodCode;
}
