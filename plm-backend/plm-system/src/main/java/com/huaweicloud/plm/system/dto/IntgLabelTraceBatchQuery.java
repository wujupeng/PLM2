package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 同步批次分页查询条件。
 * keyword 匹配 batchNo/batchName/message。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class IntgLabelTraceBatchQuery extends PageQuery {

    /** 集成对象类型。 */
    private String objectType;

    /** 批次状态。 */
    private String batchStatus;

    /** 所属接口编号。 */
    private String interfaceNo;
}
