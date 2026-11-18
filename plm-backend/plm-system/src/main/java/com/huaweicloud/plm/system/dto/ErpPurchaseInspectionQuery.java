package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 采购报检/检验单分页查询条件（G3-N3a ERP 采购管理）。
 * keyword 匹配 inspectionNo/materialCode。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpPurchaseInspectionQuery extends PageQuery {

    /** 检验状态。 */
    private String inspectionStatus;

    /** 检验结果。 */
    private String inspectionResult;

    /** 到货单号。 */
    private String receiptNo;

    /** 物料编码。 */
    private String materialCode;
}
