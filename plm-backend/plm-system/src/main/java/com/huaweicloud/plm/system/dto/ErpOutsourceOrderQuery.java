package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 委外订单分页查询条件（对应 WBS T024 委外管理、T094 委外加工闭环，属 G3 ERP）。
 * keyword 匹配 orderNo/supplierName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpOutsourceOrderQuery extends PageQuery {

    /** 订单状态。 */
    private String orderStatus;

    /** 审核状态。 */
    private String reviewStatus;

    /** 订单类型。 */
    private String orderType;

    /** 加工商编码。 */
    private String supplierCode;
}
