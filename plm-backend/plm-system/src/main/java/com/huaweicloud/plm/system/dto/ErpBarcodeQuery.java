package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 条码生成分页查询条件（对应 WBS G3-N7a ERP 条码管理）。
 * keyword 匹配 barcodeNo/bizNo/materialCode/materialName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpBarcodeQuery extends PageQuery {

    /** 条码类型。 */
    private String barcodeType;

    /** 打印状态。 */
    private String printStatus;

    /** 业务单号。 */
    private String bizNo;
}
