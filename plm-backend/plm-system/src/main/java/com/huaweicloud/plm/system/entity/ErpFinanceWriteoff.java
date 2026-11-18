package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * ERP 财务—核销单（对应 WBS T028 ERP 财务，属 G3 ERP）：
 * 登记往来款项的核销关系，关联来源单据与目标单据，支撑应收/应付核销追溯。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_finance_writeoff")
public class ErpFinanceWriteoff extends BaseEntity {

    /** 核销单号（唯一，为空时自动生成）。 */
    private String writeoffNo;

    /** 核销类型，默认 AR。 */
    private String writeoffType;

    /** 往来单位编码。 */
    private String partyCode;

    /** 往来单位名称。 */
    private String partyName;

    /** 来源单据号。 */
    private String sourceNo;

    /** 目标单据号。 */
    private String targetNo;

    /** 核销金额，默认 0。 */
    private BigDecimal writeoffAmount;

    /** 币种，默认 CNY。 */
    private String currencyCode;

    /** 核销日期。 */
    private LocalDate writeoffDate;

    /** 核销状态，默认 DRAFT。 */
    private String writeoffStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
