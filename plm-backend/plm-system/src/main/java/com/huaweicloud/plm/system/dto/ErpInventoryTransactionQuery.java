package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 库存流水分页查询条件（对应 WBS T027 库存核算、T097 库存业务，属 G3 ERP）。
 * keyword 匹配 transactionNo/materialCode/bizNo。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpInventoryTransactionQuery extends PageQuery {

    /** 交易类型。 */
    private String transactionType;

    /** 业务类型。 */
    private String bizType;

    /** 交易状态。 */
    private String transactionStatus;
}
