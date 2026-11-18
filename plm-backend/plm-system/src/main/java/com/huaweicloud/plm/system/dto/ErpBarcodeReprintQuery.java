package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 条码补打记录分页查询条件（对应 G3-N7a ERP 条码管理）。
 * keyword 匹配 reprintNo/barcodeNo/operatorName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpBarcodeReprintQuery extends PageQuery {

    /** 审批状态。 */
    private String approvalStatus;

    /** 条码编号。 */
    private String barcodeNo;
}
