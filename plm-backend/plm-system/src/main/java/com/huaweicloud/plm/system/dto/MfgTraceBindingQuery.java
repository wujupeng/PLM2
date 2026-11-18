package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 追溯码绑定分页查询条件（N8，DEV-088）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class MfgTraceBindingQuery extends PageQuery {

    /** 追溯码。 */
    private String traceCode;

    /** 生产批次号。 */
    private String batchNo;

    /** 序列号。 */
    private String serialNo;

    /** 产品编码。 */
    private String productCode;

    /** 物料编码。 */
    private String materialCode;

    /** 物料批次号。 */
    private String materialBatchNo;

    /** 追溯类型：SINGLE/BATCH。 */
    private String traceType;
}
