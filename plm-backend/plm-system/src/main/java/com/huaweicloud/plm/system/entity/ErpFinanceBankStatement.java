package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * ERP 财务—银行对账单（对应 WBS T028 ERP 财务，属 G3-N6 ERP 财务）：
 * 登记银行流水信息、收付方向与对账匹配状态，支撑银行对账追溯。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_finance_bank_statement")
public class ErpFinanceBankStatement extends BaseEntity {

    /** 对账单号（唯一，为空时自动生成）。 */
    private String statementNo;

    /** 银行账号。 */
    private String bankAccount;

    /** 开户银行名称。 */
    private String bankName;

    /** 银行交易流水号。 */
    private String transactionNo;

    /** 交易日期。 */
    private LocalDate transactionDate;

    /** 收付方向（IN 收款 / OUT 付款），默认 IN。 */
    private String direction;

    /** 交易金额，默认 0。 */
    private BigDecimal amount;

    /** 账户余额，默认 0。 */
    private BigDecimal balance;

    /** 对方户名。 */
    private String counterpartyName;

    /** 对方账号。 */
    private String counterpartyAccount;

    /** 币种编码，默认 CNY。 */
    private String currencyCode;

    /** 对账匹配状态，默认 UNMATCHED。 */
    private String matchStatus;

    /** 对账单状态，默认 IMPORTED。 */
    private String statementStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
