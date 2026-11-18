package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.math.BigDecimal;

/**
 * 出货明细行请求（N8，DEV-090）。
 */
@Data
public class MfgShipmentLineRequest {

    /** 行号。 */
    private Integer lineNo;

    /** 客户订单号。 */
    private String orderNo;

    /** 订单行号。 */
    private Integer orderLineNo;

    /** 产品编码。 */
    private String productCode;

    /** 产品版本。 */
    private String productVersion;

    /** 生产批次号。 */
    private String batchNo;

    /** 序列号。 */
    private String serialNo;

    /** 追溯码。 */
    private String traceCode;

    /** 包装编号。 */
    private String packageNo;

    /** 数量。 */
    private BigDecimal qty;

    /** 扫码状态。 */
    private String scanStatus;

    /** 明细状态。 */
    private String lineStatus;

    private String remark;
}
