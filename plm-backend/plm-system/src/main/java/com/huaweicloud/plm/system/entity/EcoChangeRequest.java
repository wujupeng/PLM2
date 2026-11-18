package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 工程变更申请（ECR）（DEV-039）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("eco_change_request")
public class EcoChangeRequest extends BaseEntity {

    /** 变更申请编号，规则 ECR-{yyyyMM}-{4 位流水号}。 */
    private String ecrNo;

    /** 变更标题。 */
    private String title;

    /** 来源类型：internal/customer/quality/supplier。 */
    private String sourceType;

    /** 来源单据引用，如质量问题单号。 */
    private String sourceRef;

    /** 变更原因。 */
    private String reason;

    /** 风险等级：low/middle/high。 */
    private String riskLevel;

    /** 紧急程度：normal/urgent/emergency。 */
    private String urgency;

    /** 受影响产品，多个以逗号分隔。 */
    private String affectedProducts;

    /** 受影响物料，多个以逗号分隔。 */
    private String affectedMaterials;

    /** 受影响图文档，多个以逗号分隔。 */
    private String affectedDocuments;

    /** 受影响工艺，多个以逗号分隔。 */
    private String affectedProcesses;

    /** 申请人 ID。 */
    private Long applicantId;

    /** 申请人姓名。 */
    private String applicantName;

    /** 状态：draft/submitted/reviewing/approved/rejected/converted/closed。 */
    private String status;

    /** 评审人 ID。 */
    private Long reviewerId;

    /** 评审人姓名。 */
    private String reviewerName;

    /** 评审意见。 */
    private String reviewComment;

    /** 评审时间。 */
    private LocalDateTime reviewedAt;

    private String remark;
}
