package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * ERP 财务—应付单（对应 WBS T028 ERP 财务，属 G3 ERP）：
 * 登记对供应商的应付金额、已结算金额与应付余额，支撑应付账款核算与到期跟踪。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_finance_payable")
public class ErpFinancePayable extends BaseEntity {

    /** 应付单号（唯一，为空时自动生成）。 */
    private String apNo;

    /** 供应商编码。 */
    private String supplierCode;

    /** 供应商名称。 */
    private String supplierName;

    /** 发票号。 */
    private String invoiceNo;

    /** 来源单号。 */
    private String sourceNo;

    /** 应付金额，默认 0。 */
    private BigDecimal apAmount;

    /** 已结算金额，默认 0。 */
    private BigDecimal settledAmount;

    /** 应付余额，默认 0。 */
    private BigDecimal apBalance;

    /** 币种，默认 CNY。 */
    private String currencyCode;

    /** 应付日期。 */
    private LocalDate apDate;

    /** 到期日期。 */
    private LocalDate dueDate;

    /** 应付状态，默认 OPEN。 */
    private String apStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
