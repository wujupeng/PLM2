package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.math.BigDecimal;

/**
 * ASN 明细行保存请求。
 */
@Data
public class EdiAsnLineSaveRequest {

    /** 行号，为空时按顺序自动取 1..n。 */
    private Integer lineNo;

    /** 物料编码。 */
    private String materialCode;

    /** 数量。 */
    private BigDecimal qty;

    /** 单位。 */
    private String unit;

    /** 批次号。 */
    private String batchNo;

    /** 包装编码。 */
    private String packageCode;

    /** 箱码。 */
    private String boxCode;

    private String remark;
}
