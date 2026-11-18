package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

/**
 * 5M 变更追踪（OA-DEV-072）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_biz_five_m_change")
public class OaBizFiveMChange extends BaseEntity {

    /** 变更单号。 */
    private String changeNo;

    /** 变更类别（5M：人/机/料/法/环）。 */
    private String changeCategory;

    private String changeTitle;

    private String productCode;

    private String productName;

    private String partCode;

    private String changeDesc;

    private String riskAnalysis;

    private String riskLevel;

    private String verificationPlan;

    private String verificationResult;

    private LocalDate effectiveDate;

    private String closeCondition;

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
