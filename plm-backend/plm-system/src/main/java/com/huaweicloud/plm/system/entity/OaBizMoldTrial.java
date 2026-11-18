package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 新开模检查与零件试流（OA-DEV-077，关联 PLM 物料与质量问题）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_biz_mold_trial")
public class OaBizMoldTrial extends BaseEntity {

    /** 试流单号。 */
    private String trialNo;

    /** 试流类型：MOLD_CHECK 等。 */
    private String trialType;

    private String moldCode;

    private String moldName;

    private String partCode;

    private String partName;

    private String materialCode;

    private String materialName;

    private String supplierCode;

    private String supplierName;

    private String checkItems;

    private String checkResult;

    private BigDecimal trialQty;

    private String trialResult;

    private String trialIssue;

    private String verifyConclusion;

    private String plmRefNo;

    private LocalDate trialDate;

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
