package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * OA↔六系统接收回执分页查询条件。
 * keyword 匹配 receiptNo/objectNo/systemObjectId。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class IntgOaSystemsReceiptQuery extends PageQuery {

    /** 集成对象类型。 */
    private String objectType;

    /** 回执状态。 */
    private String receiptStatus;

    /** 批次号。 */
    private String batchNo;
}
