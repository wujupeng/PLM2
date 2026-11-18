package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * ERP 财务—收付款单（对应 WBS T028 ERP 财务，属 G3 ERP）：
 * 登记与往来单位之间的收/付款信息，含银行账户、结算方式、金额与币种，支撑财务收付款追溯。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_finance_payment")
public class ErpFinancePayment extends BaseEntity {

    /** 收付款单号（唯一，为空时自动生成）。 */
    private String paymentNo;

    /** 收付款类型，默认 RECEIPT。 */
    private String paymentType;

    /** 往来单位类型，默认 CUSTOMER。 */
    private String partyType;

    /** 往来单位编码。 */
    private String partyCode;

    /** 往来单位名称。 */
    private String partyName;

    /** 银行账号。 */
    private String bankAccount;

    /** 开户银行。 */
    private String bankName;

    /** 结算方式，默认 TRANSFER。 */
    private String paymentMethod;

    /** 金额，默认 0。 */
    private BigDecimal amount;

    /** 币种，默认 CNY。 */
    private String currencyCode;

    /** 收付款日期。 */
    private LocalDate paymentDate;

    /** 来源单据号。 */
    private String sourceNo;

    /** 收付款状态，默认 DRAFT。 */
    private String paymentStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
