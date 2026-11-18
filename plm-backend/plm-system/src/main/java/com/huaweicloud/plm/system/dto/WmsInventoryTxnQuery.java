package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 库存流水分页查询条件（N7，DEV-081）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class WmsInventoryTxnQuery extends PageQuery {

    /** 流水类型：INBOUND/ISSUE/CONSUME/RETURN/SCRAP/COUNT_ADJUST/TRANSFER。 */
    private String txnType;

    /** 物料编码。 */
    private String materialCode;

    /** 批次号。 */
    private String batchNo;

    /** 产线。 */
    private String lineCode;

    /** 工单号。 */
    private String workOrderNo;

    /** 关联单据号。 */
    private String refNo;
}
