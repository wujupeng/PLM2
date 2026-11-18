package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * MES 工时记录分页查询条件。
 * keyword 匹配 laborNo/workOrderNo/worker/materialCode/materialName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class MesLaborHourQuery extends PageQuery {

    /** 工时状态。 */
    private String laborStatus;

    /** 作业人员。 */
    private String worker;

    /** 工单号。 */
    private String workOrderNo;

    /** 物料编码。 */
    private String materialCode;
}
