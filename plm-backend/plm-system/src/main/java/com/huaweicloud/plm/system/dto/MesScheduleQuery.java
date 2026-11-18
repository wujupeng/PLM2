package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 排产计划分页查询条件。
 * keyword 匹配 scheduleNo/workOrderNo/materialCode/materialName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class MesScheduleQuery extends PageQuery {

    /** 排产状态。 */
    private String scheduleStatus;

    /** 产线编码。 */
    private String lineCode;

    /** 生产工单号。 */
    private String workOrderNo;

    /** 物料编码。 */
    private String materialCode;
}
