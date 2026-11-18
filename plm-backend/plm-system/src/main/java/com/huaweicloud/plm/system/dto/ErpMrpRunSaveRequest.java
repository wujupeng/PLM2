package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * MRP/LRP 运算批次保存请求（对应 WBS T025 需求计划、T095 LRP/MRP需求计划，属 G3 ERP）。
 */
@Data
public class ErpMrpRunSaveRequest {

    /** 运算单号（为空时自动生成）。 */
    private String runNo;

    /** 运算类型，为空默认 MRP。 */
    private String runType;

    /** 关联需求计划号。 */
    private String planNo;

    /** 运算范围，为空默认 ALL。 */
    private String runScope;

    /** 运算日期。 */
    private LocalDateTime runDate;

    /** 运算人。 */
    private String runBy;

    /** 参与运算需求条数，为空默认 0。 */
    private Integer demandCount;

    /** 生成建议条数，为空默认 0。 */
    private Integer suggestionCount;

    /** 运算状态，为空默认 DRAFT。 */
    private String runStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
