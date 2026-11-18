package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 客户需求分页查询条件（N6，DEV-066）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class EdiCustomerDemandQuery extends PageQuery {

    /** 伙伴编码。 */
    private String partnerCode;

    /** 客户编码。 */
    private String customerCode;

    /** 交易代码。 */
    private String transCode;

    /** 单据类型：ORDER/FORECAST。 */
    private String docType;

    /** 状态：NEW/CHANGED/DISPATCHED/CONFIRMED/CLOSED。 */
    private String status;

    /** 物料编码。 */
    private String materialCode;

    /** 客户订单号。 */
    private String customerOrderNo;
}
