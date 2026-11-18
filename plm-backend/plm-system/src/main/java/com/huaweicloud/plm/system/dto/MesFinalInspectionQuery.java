package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 终检记录分页查询条件。
 * keyword 匹配 finalNo/workOrderNo/materialCode/customerCode。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class MesFinalInspectionQuery extends PageQuery {

    /** 检验状态。 */
    private String inspectionStatus;

    /** 检验结果。 */
    private String inspectionResult;

    /** 工单号。 */
    private String workOrderNo;

    /** 物料编码。 */
    private String materialCode;

    /** 客户编码。 */
    private String customerCode;
}
