package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

/**
 * 样品试制问题改善（OA-DEV-073，关联 PLM 产品/BOM/文档）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_biz_sample_issue")
public class OaBizSampleIssue extends BaseEntity {

    /** 问题单号。 */
    private String issueNo;

    private String projectCode;

    private String projectName;

    private String productCode;

    private String bomCode;

    private String partCode;

    private String partName;

    private String issueType;

    private String issueDesc;

    private String severity;

    private Long responsibleUserId;

    private String responsibleName;

    private LocalDate dueDate;

    private String measure;

    private String verifyResult;

    /** 问题状态：OPEN/CLOSED 等。 */
    private String issueStatus;

    private String plmRefNo;

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
