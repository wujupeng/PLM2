package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 订单变更分页查询条件（G3-N2 ERP 销售管理）。
 * keyword 匹配 changeNo/orderNo/changeReason。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpOrderChangeQuery extends PageQuery {

    /** 变更状态。 */
    private String changeStatus;

    /** 变更类型。 */
    private String changeType;

    /** 关联销售订单编号。 */
    private String orderNo;
}
