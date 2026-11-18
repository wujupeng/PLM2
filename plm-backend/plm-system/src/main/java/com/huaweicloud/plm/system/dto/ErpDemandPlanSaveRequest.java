package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 需求计划头保存请求（对应 WBS T025 需求计划、T095 LRP/MRP需求计划，属 G3 ERP）。
 */
@Data
public class ErpDemandPlanSaveRequest {

    /** 需求计划单号（为空时自动生成）。 */
    private String planNo;

    /** 需求计划名称。 */
    private String planName;

    /** 计划类型，为空默认 ORDER。 */
    private String planType;

    /** 计划来源，为空默认 SALES。 */
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

    /** 币别，为空默认 CNY。 */
    private String currencyCode;

    /** 计划状态，为空默认 DRAFT。 */
    private String planStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
