package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 应收单分页查询条件（对应 WBS T028 ERP 财务，属 G3 ERP）。
 * keyword 匹配 arNo/customerName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpFinanceReceivableQuery extends PageQuery {

    /** 应收状态。 */
    private String arStatus;

    /** 客户编码。 */
    private String customerCode;
}
