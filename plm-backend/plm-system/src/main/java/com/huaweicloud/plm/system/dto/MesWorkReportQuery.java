package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 工序报工单分页查询条件。
 * keyword 匹配 reportNo/workOrderNo/dispatchNo/processCode/materialCode/materialName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class MesWorkReportQuery extends PageQuery {

    /** 报工状态。 */
    private String reportStatus;

    /** 报工类型。 */
    private String reportType;

    /** 生产工单号。 */
    private String workOrderNo;

    /** 派工单号。 */
    private String dispatchNo;

    /** 工序编码。 */
    private String processCode;

    /** 物料编码。 */
    private String materialCode;
}
