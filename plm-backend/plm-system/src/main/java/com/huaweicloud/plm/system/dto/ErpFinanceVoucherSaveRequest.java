package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 记账凭证头保存请求（对应 WBS T028 ERP 财务，属 G3-N6 ERP 财务）。
 */
@Data
public class ErpFinanceVoucherSaveRequest {

    /** 凭证号（为空时自动生成）。 */
    private String voucherNo;

    /** 凭证字，为空默认「记」。 */
    private String voucherWord;

    /** 会计期间编码。 */
    private String periodCode;

    /** 记账日期。 */
    private LocalDate voucherDate;

    /** 业务类型，为空默认 MANUAL。 */
    private String bizType;

    /** 来源单号。 */
    private String sourceNo;

    /** 借方合计，为空默认 0。 */
    private BigDecimal totalDebit;

    /** 贷方合计，为空默认 0。 */
    private BigDecimal totalCredit;

    /** 附件张数，为空默认 0。 */
    private Integer attachmentCount;

    /** 凭证状态，为空默认 DRAFT。 */
    private String voucherStatus;

    /** 凭证摘要。 */
    private String summary;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
