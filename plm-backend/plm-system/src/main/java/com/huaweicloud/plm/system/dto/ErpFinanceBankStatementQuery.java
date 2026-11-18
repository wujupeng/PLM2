package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 银行对账单分页查询条件（对应 WBS T028 ERP 财务，属 G3-N6 ERP 财务）。
 * keyword 匹配 statementNo/transactionNo/counterpartyName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpFinanceBankStatementQuery extends PageQuery {

    /** 收付方向。 */
    private String direction;

    /** 对账匹配状态。 */
    private String matchStatus;

    /** 对账单状态。 */
    private String statementStatus;

    /** 银行账号。 */
    private String bankAccount;
}
