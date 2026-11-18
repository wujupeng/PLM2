package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 应收账款分页查询条件（G3-N2 ERP 销售管理）。
 * keyword 匹配 arNo/invoiceNo/customerName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpSalesReceivableQuery extends PageQuery {

    /** 应收状态。 */
    private String arStatus;

    /** 关联销售发票编号。 */
    private String invoiceNo;

    /** 客户编码。 */
    private String customerCode;
}
