package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * SRM 寻源与询报价—采购需求寻源（对应采购需求寻源）：
 * 登记寻源单号、寻源标题、物料信息、需求数量与日期、寻源方式与预算，支撑采购需求寻源追溯。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("srm_sourcing_request")
public class SrmSourcingRequest extends BaseEntity {

    /** 寻源单号（唯一，为空时自动生成）。 */
    private String sourcingNo;

    /** 寻源标题。 */
    private String sourcingTitle;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格型号。 */
    private String spec;

    /** 需求数量。 */
    private BigDecimal demandQty;

    /** 单位。 */
    private String unit;

    /** 需求日期。 */
    private LocalDate demandDate;

    /** 需求部门。 */
    private String demandDept;

    /** 申请人。 */
    private String applicant;

    /** 寻源方式，默认 RFQ。 */
    private String sourcingType;

    /** 预算金额。 */
    private BigDecimal budgetAmount;

    /** 币种，默认 CNY。 */
    private String currency;

    /** 状态，默认 DRAFT。 */
    private String sourcingStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
