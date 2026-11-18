package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 生产补料单分页查询条件（对应 WBS T026 生产管理、T096 生产订单与补料，属 G3 ERP）。
 * keyword 匹配 additionNo/materialName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpMaterialAdditionQuery extends PageQuery {

    /** 补料状态。 */
    private String additionStatus;

    /** 补料类型。 */
    private String additionType;

    /** 生产订单号。 */
    private String orderNo;
}
