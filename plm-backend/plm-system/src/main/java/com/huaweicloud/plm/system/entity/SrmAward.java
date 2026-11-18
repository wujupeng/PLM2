package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * SRM 寻源与询报价—定点定标（对应定点定标单）：
 * 登记定点单号、询价/比价来源、物料与供应商信息、定点数量与单价金额、定点与审批信息、定点状态，支撑定点定标追溯。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("srm_award")
public class SrmAward extends BaseEntity {

    /** 定点单号（唯一，为空时自动生成）。 */
    private String awardNo;

    /** 询价单号。 */
    private String rfqNo;

    /** 比价单号。 */
    private String compareNo;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格型号。 */
    private String spec;

    /** 定点类型，默认 SINGLE。 */
    private String awardType;

    /** 供应商编码。 */
    private String supplierCode;

    /** 供应商名称。 */
    private String supplierName;

    /** 定点数量。 */
    private BigDecimal awardQty;

    /** 单位。 */
    private String unit;

    /** 定点单价。 */
    private BigDecimal awardPrice;

    /** 定点金额。 */
    private BigDecimal awardAmount;

    /** 币种，默认 CNY。 */
    private String currency;

    /** 定点日期。 */
    private LocalDate awardDate;

    /** 定标人。 */
    private String awardBy;

    /** 审批人。 */
    private String approver;

    /** 审批日期。 */
    private LocalDate approveDate;

    /** 状态，默认 DRAFT。 */
    private String awardStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
