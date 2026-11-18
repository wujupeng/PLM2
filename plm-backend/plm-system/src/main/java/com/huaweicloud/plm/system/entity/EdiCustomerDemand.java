package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 客户需求标准对象（N6，DEV-066/067/069）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("edi_customer_demand")
public class EdiCustomerDemand extends BaseEntity {

    /** 需求编号（唯一）。 */
    private String demandNo;

    /** 来源报文编号。 */
    private String messageNo;

    /** 伙伴编码。 */
    private String partnerCode;

    /** 交易代码。 */
    private String transCode;

    /** 单据类型：ORDER/FORECAST。 */
    private String docType;

    /** 需求版本号，默认 1。 */
    private Integer demandVersion;

    /** 客户订单号。 */
    private String customerOrderNo;

    /** 客户订单行号。 */
    private String customerLineNo;

    /** 客户编码。 */
    private String customerCode;

    /** 物料编码。 */
    private String materialCode;

    /** 产品编码。 */
    private String productCode;

    /** 数量。 */
    private BigDecimal qty;

    /** 单位。 */
    private String unit;

    /** 需求交期。 */
    private LocalDate requiredDate;

    /** 收货地址。 */
    private String shipTo;

    /** 工厂编码。 */
    private String plantCode;

    /** 状态：NEW/CHANGED/CONFIRMED/CLOSED。 */
    private String status;

    /** 变更类型。 */
    private String changeType;

    /** 变更前数量。 */
    private BigDecimal prevQty;

    /** 变更前交期。 */
    private LocalDate prevRequiredDate;

    /** 变更原因。 */
    private String changeReason;

    private String remark;
}
