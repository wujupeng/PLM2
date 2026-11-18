package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * ERP↔WMS 接收回执分页查询条件。
 * keyword 匹配 receiptNo/objectNo/wmsObjectId。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class IntgErpWmsReceiptQuery extends PageQuery {

    /** 集成对象类型。 */
    private String objectType;

    /** 回执状态。 */
    private String receiptStatus;

    /** 批次号。 */
    private String batchNo;
}
