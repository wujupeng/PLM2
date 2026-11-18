package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 上架任务分页查询条件（对应上架任务）。
 * keyword 匹配 taskNo/receiptNo/materialCode/materialName/batchNo。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class WmsPutawayTaskQuery extends PageQuery {

    /** 上架状态。 */
    private String putawayStatus;

    /** 收货单号。 */
    private String receiptNo;

    /** 物料编码。 */
    private String materialCode;

    /** 目标库位。 */
    private String toBinCode;
}
