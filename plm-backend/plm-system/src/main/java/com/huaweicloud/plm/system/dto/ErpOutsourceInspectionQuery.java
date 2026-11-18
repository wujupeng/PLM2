package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 委外报检单分页查询条件（对应 WBS T024 委外管理、T094 委外加工闭环，属 G3 ERP）。
 * keyword 匹配 inspectionNo/materialCode。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpOutsourceInspectionQuery extends PageQuery {

    /** 报检单状态。 */
    private String inspectionStatus;

    /** 检验结果。 */
    private String inspectionResult;

    /** 到货单号。 */
    private String receiptNo;

    /** 物料编码。 */
    private String materialCode;
}
