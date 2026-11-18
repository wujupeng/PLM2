package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * ERP 财务—记账凭证头（对应 WBS T028 ERP 财务，属 G3-N6 ERP 财务）：
 * 记录总账凭证的凭证号、凭证字、会计期间、记账日期、业务类型与来源单号，
 * 以及借贷合计、附件张数与凭证状态等信息，分录行见 {@link ErpFinanceVoucherLine}。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_finance_voucher")
public class ErpFinanceVoucher extends BaseEntity {

    /** 凭证号（唯一，支持人工指定，为空时自动生成）。 */
    private String voucherNo;

    /** 凭证字，默认「记」。 */
    private String voucherWord;

    /** 会计期间编码。 */
    private String periodCode;

    /** 记账日期。 */
    private LocalDate voucherDate;

    /** 业务类型，默认 MANUAL（手工凭证）。 */
    private String bizType;

    /** 来源单号。 */
    private String sourceNo;

    /** 借方合计，默认 0。 */
    private BigDecimal totalDebit;

    /** 贷方合计，默认 0。 */
    private BigDecimal totalCredit;

    /** 附件张数，默认 0。 */
    private Integer attachmentCount;

    /** 凭证状态，默认 DRAFT。 */
    private String voucherStatus;

    /** 凭证摘要。 */
    private String summary;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
