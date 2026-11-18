package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 银行对账单保存请求（对应 WBS T028 ERP 财务，属 G3-N6 ERP 财务）。
 */
@Data
public class ErpFinanceBankStatementSaveRequest {

    /** 对账单号（为空时自动生成）。 */
    private String statementNo;

    /** 银行账号。 */
    @NotBlank(message = "银行账号不能为空")
    private String bankAccount;

    /** 开户银行名称。 */
    private String bankName;

    /** 银行交易流水号。 */
    private String transactionNo;

    /** 交易日期。 */
    private LocalDate transactionDate;

    /** 收付方向（IN 收款 / OUT 付款），为空默认 IN。 */
    private String direction;

    /** 交易金额，为空默认 0。 */
    private BigDecimal amount;

    /** 账户余额，为空默认 0。 */
    private BigDecimal balance;

    /** 对方户名。 */
    private String counterpartyName;

    /** 对方账号。 */
    private String counterpartyAccount;

    /** 币种编码，为空默认 CNY。 */
    private String currencyCode;

    /** 对账匹配状态，为空默认 UNMATCHED。 */
    private String matchStatus;

    /** 对账单状态，为空默认 IMPORTED。 */
    private String statementStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
