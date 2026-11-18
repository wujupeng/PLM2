package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 计划达成记录分页查询条件。
 * keyword 匹配 planNo/workOrderNo/materialCode/materialName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class MesKanbanPlanQuery extends PageQuery {

    /** 记录状态。 */
    private String recordStatus;

    /** 工单号。 */
    private String workOrderNo;

    /** 物料编码。 */
    private String materialCode;

    /** 产线编码。 */
    private String lineCode;
}
