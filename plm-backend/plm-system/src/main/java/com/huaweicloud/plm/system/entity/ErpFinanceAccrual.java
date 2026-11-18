package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * ERP 财务—暂估（对应 WBS T028 ERP 财务，属 G3-N6 ERP 财务）：
 * 登记暂估类型、往来单位、来源单号与暂估金额/税额，支撑期末暂估与冲回。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_finance_accrual")
public class ErpFinanceAccrual extends BaseEntity {

    /** 暂估单号（唯一，为空时自动生成）。 */
    private String accrualNo;

    /** 暂估类型，默认 AP。 */
    private String accrualType;

    /** 往来单位编码。 */
    private String partyCode;

    /** 往来单位名称。 */
    private String partyName;

    /** 来源单号。 */
    private String sourceNo;

    /** 会计期间编码。 */
    private String periodCode;

    /** 暂估金额，默认 0。 */
    private BigDecimal amount;

    /** 税额，默认 0。 */
    private BigDecimal taxAmount;

    /** 币种，默认 CNY。 */
    private String currencyCode;

    /** 暂估日期。 */
    private LocalDate accrualDate;

    /** 是否已冲回，0=未冲回，默认 0。 */
    private Integer reversed;

    /** 暂估状态，默认 DRAFT。 */
    private String accrualStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
