package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * ERP 需求计划—需求计划单头（对应 WBS T025 需求计划、T095 LRP/MRP需求计划，属 G3 ERP）：
 * 记录需求计划的计划组织、计划员、展望期与币别状态等主信息，
 * 明细行见 {@link ErpDemandPlanLine}。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_demand_plan")
public class ErpDemandPlan extends BaseEntity {

    /** 需求计划单号（唯一，支持人工指定，为空时自动生成）。 */
    private String planNo;

    /** 需求计划名称。 */
    private String planName;

    /** 计划类型，默认 ORDER。 */
    private String planType;

    /** 计划来源，默认 SALES。 */
    private String planSource;

    /** 计划组织。 */
    private String planOrg;

    /** 计划员。 */
    private String planner;

    /** 计划日期。 */
    private LocalDateTime planDate;

    /** 计划展望期开始。 */
    private LocalDateTime horizonStart;

    /** 计划展望期结束。 */
    private LocalDateTime horizonEnd;

    /** 币别，默认 CNY。 */
    private String currencyCode;

    /** 计划状态，默认 DRAFT。 */
    private String planStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
