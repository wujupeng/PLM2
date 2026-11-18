package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 订单拆分单分页查询条件（对应 WBS T026 生产管理、T096 生产订单与补料，属 G3 ERP）。
 * keyword 匹配 splitNo/sourceOrderNo/targetOrderNo。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpProductionOrderSplitQuery extends PageQuery {

    /** 拆分状态。 */
    private String splitStatus;

    /** 拆分类型。 */
    private String splitType;

    /** 源生产订单号。 */
    private String sourceOrderNo;
}
