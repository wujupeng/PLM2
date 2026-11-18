package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 派工任务分页查询条件。
 * keyword 匹配 dispatchNo/workOrderNo/processCode/materialCode/materialName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class MesDispatchQuery extends PageQuery {

    /** 派工状态。 */
    private String dispatchStatus;

    /** 工序编码。 */
    private String processCode;

    /** 生产工单号。 */
    private String workOrderNo;

    /** 物料编码。 */
    private String materialCode;
}
