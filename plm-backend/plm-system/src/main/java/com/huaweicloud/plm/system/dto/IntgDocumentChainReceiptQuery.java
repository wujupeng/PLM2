package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 单据全链路接收回执分页查询条件。
 * keyword 匹配 receiptNo/objectNo/chainObjectId。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class IntgDocumentChainReceiptQuery extends PageQuery {

    /** 集成对象类型。 */
    private String objectType;

    /** 回执状态。 */
    private String receiptStatus;

    /** 批次号。 */
    private String batchNo;
}
