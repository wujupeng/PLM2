package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * ERP 财务—发票登记（对应 WBS T028 ERP 财务，属 G3-N6 ERP 财务）：
 * 登记进销项发票的票面信息、金额税额与查验状态，支撑发票台账追溯。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_finance_invoice")
public class ErpFinanceInvoice extends BaseEntity {

    /** 发票号码（唯一，由用户提供）。 */
    private String invoiceNo;

    /** 发票代码。 */
    private String invoiceCode;

    /** 发票类型，默认 VAT_SPECIAL。 */
    private String invoiceType;

    /** 收发方向（IN 进项 / OUT 销项），默认 OUT。 */
    private String direction;

    /** 往来单位类型，默认 CUSTOMER。 */
    private String partyType;

    /** 往来单位编码。 */
    private String partyCode;

    /** 往来单位名称。 */
    private String partyName;

    /** 来源单号。 */
    private String sourceNo;

    /** 不含税金额，默认 0。 */
    private BigDecimal amount;

    /** 税率，默认 0。 */
    private BigDecimal taxRate;

    /** 税额，默认 0。 */
    private BigDecimal taxAmount;

    /** 价税合计，默认 0。 */
    private BigDecimal totalAmount;

    /** 币种编码，默认 CNY。 */
    private String currencyCode;

    /** 开票日期。 */
    private LocalDate invoiceDate;

    /** 查验状态，默认 UNVERIFIED。 */
    private String verifyStatus;

    /** 发票状态，默认 DRAFT。 */
    private String invoiceStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
