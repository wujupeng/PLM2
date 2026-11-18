package com.huaweicloud.plm.system.dto;

import lombok.Data;

/**
 * 追溯查询条件（N8，DEV-093）。
 */
@Data
public class MfgTraceQuery {

    /** 追溯码（单件码/批次码）。反向追溯使用。 */
    private String traceCode;

    /** 序列号。 */
    private String serialNo;

    /** 生产批次号。 */
    private String batchNo;

    /** 物料编码。正向追溯使用。 */
    private String materialCode;

    /** 物料批次号。正向追溯使用。 */
    private String materialBatchNo;

    /** 客户编码（筛选）。 */
    private String customerCode;
}
