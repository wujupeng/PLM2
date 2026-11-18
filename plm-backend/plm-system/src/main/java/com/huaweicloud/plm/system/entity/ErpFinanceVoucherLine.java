package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

/**
 * ERP 财务—记账凭证分录行（对应 WBS T028 ERP 财务，属 G3-N6 ERP 财务）：
 * 记录凭证分录行的科目、摘要、借贷金额、币种与汇率，以及部门/项目/物料等辅助核算信息，
 * 隶属记账凭证头 {@link ErpFinanceVoucher}。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_finance_voucher_line")
public class ErpFinanceVoucherLine extends BaseEntity {

    /** 所属记账凭证头 ID。 */
    private Long voucherId;

    /** 行号。 */
    private Integer lineNo;

    /** 科目编码。 */
    private String accountCode;

    /** 科目名称。 */
    private String accountName;

    /** 摘要。 */
    private String summary;

    /** 借方金额，默认 0。 */
    private BigDecimal debitAmount;

    /** 贷方金额，默认 0。 */
    private BigDecimal creditAmount;

    /** 币种编码，默认 CNY。 */
    private String currencyCode;

    /** 汇率，默认 1。 */
    private BigDecimal exchangeRate;

    /** 部门编码。 */
    private String deptCode;

    /** 项目编码。 */
    private String projectCode;

    /** 物料编码。 */
    private String materialCode;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
