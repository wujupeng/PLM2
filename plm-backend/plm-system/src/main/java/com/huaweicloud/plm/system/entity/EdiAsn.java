package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * ASN 与交付反馈（N6，DEV-072）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("edi_asn")
public class EdiAsn extends BaseEntity {

    /** ASN 编号（唯一）。 */
    private String asnNo;

    /** 分发编号。 */
    private String dispatchNo;

    /** 需求编号。 */
    private String demandNo;

    /** 交易代码，默认 856。 */
    private String transCode;

    /** ASN 类型：OUTBOUND/INBOUND。 */
    private String asnType;

    /** 客户编码。 */
    private String customerCode;

    /** 供应商编码。 */
    private String supplierCode;

    /** 收货地址。 */
    private String shipTo;

    /** 承运商。 */
    private String carrier;

    /** 运单号。 */
    private String trackingNo;

    /** 车牌号。 */
    private String plateNo;

    /** 发货日期。 */
    private LocalDate shipDate;

    /** 预计到达日期。 */
    private LocalDate etaDate;

    /** 总数量。 */
    private BigDecimal totalQty;

    /** 箱数。 */
    private Integer packageCount;

    /** 状态：CREATED/SENT/ACKED。 */
    private String status;

    /** 发送时间。 */
    private LocalDateTime sendAt;

    /** 回执时间。 */
    private LocalDateTime ackAt;

    private String remark;
}
