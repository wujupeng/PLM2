package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 设计工程变更风险评审 ECR（OA-DEV-075，PLM 为技术变更权威记录）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_biz_ecr_risk_review")
public class OaBizEcrRiskReview extends BaseEntity {

    /** 变更评审单号。 */
    private String ecrNo;

    private String ecrTitle;

    /** 变更类型：ECR/ECN 等。 */
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

    private Long applicantUserId;

    private String applicantName;

    private Long orgId;

    private String orgName;

    private String attachmentJson;

    /** 流程状态：DRAFT/RUNNING/APPROVED/REJECTED/CANCELLED。 */
    private String flowStatus;

    private Long instanceId;

    private String instanceNo;

    private Integer cancelFlag;

    private String remark;
}
