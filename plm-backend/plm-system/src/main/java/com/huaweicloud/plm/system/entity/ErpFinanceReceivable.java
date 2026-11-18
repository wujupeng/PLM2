package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * ERP 财务—应收单（对应 WBS T028 ERP 财务，属 G3 ERP）：
 * 登记对客户的应收金额、已结算金额与应收余额，支撑应收账款核算与到期跟踪。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_finance_receivable")
public class ErpFinanceReceivable extends BaseEntity {

    /** 应收单号（唯一，为空时自动生成）。 */
    private String arNo;

    /** 客户编码。 */
    private String customerCode;

    /** 客户名称。 */
    private String customerName;

    /** 发票号。 */
    private String invoiceNo;

    /** 来源单号。 */
    private String sourceNo;

    /** 应收金额，默认 0。 */
    private BigDecimal arAmount;

    /** 已结算金额，默认 0。 */
    private BigDecimal settledAmount;

    /** 应收余额，默认 0。 */
    private BigDecimal arBalance;

    /** 币种，默认 CNY。 */
    private String currencyCode;

    /** 应收日期。 */
    private LocalDate arDate;

    /** 到期日期。 */
    private LocalDate dueDate;

    /** 应收状态，默认 OPEN。 */
    private String arStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
