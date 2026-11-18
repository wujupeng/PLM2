package com.huaweicloud.plm.system.dto;

import lombok.Data;

/**
 * 设计工程变更风险评审保存入参（OA-DEV-075）。PLM 为技术变更权威记录，OA 承载审批协同。
 */
@Data
public class BizEcrRiskReviewSaveRequest {

    private String ecrTitle;

    /** 变更类型：oa_ecr_change_type（ECR/ECO）。 */
    private String changeType;

    private String productCode;

    private String productName;

    private String materialCode;

    private String materialName;

    private String changeReason;

    private String riskDesc;

    private String impactAnalysis;

    private String countermeasure;

    private String reviewConclusion;

    private String plmChangeNo;

    private String plmChangeStatus;

    private String attachmentJson;

    private String remark;

    private Boolean submit;
}
