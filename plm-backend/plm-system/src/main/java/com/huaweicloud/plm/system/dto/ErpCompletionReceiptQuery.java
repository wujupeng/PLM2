package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 完工入库单分页查询条件（对应 WBS T026 生产管理、T096 生产订单与补料，属 G3 ERP）。
 * keyword 匹配 receiptNo/materialName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpCompletionReceiptQuery extends PageQuery {

    /** 入库状态。 */
    private String receiptStatus;

    /** 检验状态。 */
    private String inspectionStatus;

    /** 生产订单号。 */
    private String orderNo;
}
