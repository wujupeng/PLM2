package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 批次追溯分页查询条件。
 * keyword 匹配 batchNo/materialCode/materialName/workOrderNo。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class MesBatchTraceQuery extends PageQuery {

    /** 批次状态。 */
    private String batchStatus;

    /** 物料编码。 */
    private String materialCode;

    /** 工单号。 */
    private String workOrderNo;
}
