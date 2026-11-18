package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.math.BigDecimal;

/**
 * 包装明细行请求（N8，DEV-089）。
 */
@Data
public class MfgPackageItemRequest {

    /** 序列号。 */
    private String serialNo;

    /** 追溯码。 */
    private String traceCode;

    /** 物料/产品编码。 */
    private String materialCode;

    /** 物料批次号。 */
    private String materialBatchNo;

    /** 数量。 */
    private BigDecimal quantity;

    /** 明细状态。 */
    private String itemStatus;

    private String remark;
}
