package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 生产订单分页查询条件（对应 WBS T026 生产管理、T096 生产订单与补料，属 G3 ERP）。
 * keyword 匹配 orderNo/materialName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpProductionOrderQuery extends PageQuery {

    /** 订单状态。 */
    private String orderStatus;

    /** 订单类型。 */
    private String orderType;

    /** 生产物料编码。 */
    private String materialCode;

    /** 关联需求计划号。 */
    private String planNo;
}
