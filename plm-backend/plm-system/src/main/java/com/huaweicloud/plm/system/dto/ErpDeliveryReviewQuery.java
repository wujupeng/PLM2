package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 交期评审分页查询条件（G3-N2 ERP 销售管理）。
 * keyword 匹配 reviewNo/orderNo/materialCode。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpDeliveryReviewQuery extends PageQuery {

    /** 评审状态。 */
    private String reviewStatus;

    /** 评审结果。 */
    private String reviewResult;

    /** 销售订单号。 */
    private String orderNo;
}
