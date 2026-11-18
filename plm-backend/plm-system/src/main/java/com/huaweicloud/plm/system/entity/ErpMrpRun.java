package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * ERP 需求计划—MRP/LRP 运算批次（对应 WBS T025 需求计划、T095 LRP/MRP需求计划，属 G3 ERP）：
 * 登记一次 MRP/LRP 运算的单号、范围、参与需求条数与生成建议条数等，支撑需求计划的运算过程追溯。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_mrp_run")
public class ErpMrpRun extends BaseEntity {

    /** 运算单号（唯一，支持人工指定，为空时自动生成）。 */
    private String runNo;

    /** 运算类型，默认 MRP。 */
    private String runType;

    /** 关联需求计划号。 */
    private String planNo;

    /** 运算范围，默认 ALL。 */
    private String runScope;

    /** 运算日期。 */
    private LocalDateTime runDate;

    /** 运算人。 */
    private String runBy;

    /** 参与运算需求条数，默认 0。 */
    private Integer demandCount;

    /** 生成建议条数，默认 0。 */
    private Integer suggestionCount;

    /** 运算状态，默认 DRAFT。 */
    private String runStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
