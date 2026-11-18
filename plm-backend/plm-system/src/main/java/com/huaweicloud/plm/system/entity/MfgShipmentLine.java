package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

/**
 * 出货单明细（N8，DEV-090/091）：订单行、产品版本、批次、单件码与箱码。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("mfg_shipment_line")
public class MfgShipmentLine extends BaseEntity {

    /** 出货单号。 */
    private String shipmentNo;

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

    /** 扫码状态：PENDING/PARTIAL/SCANNED。 */
    private String scanStatus;

    /** 明细状态：OPEN/CLOSED/CANCELLED。 */
    private String lineStatus;

    private String remark;
}
