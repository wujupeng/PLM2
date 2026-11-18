package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 核销单分页查询条件（对应 WBS T028 ERP 财务，属 G3 ERP）。
 * keyword 匹配 writeoffNo/sourceNo/targetNo。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpFinanceWriteoffQuery extends PageQuery {

    /** 核销类型。 */
    private String writeoffType;

    /** 核销状态。 */
    private String writeoffStatus;

    /** 往来单位编码。 */
    private String partyCode;
}
