package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

/**
 * 整改跟踪保存请求（对应整改跟踪）。
 */
@Data
public class SrmRectificationSaveRequest {

    /** 整改单号（为空时自动生成）。 */
    private String rectificationNo;

    /** 来源单号。 */
    @NotBlank(message = "来源单号不能为空")
    private String sourceNo;

    /** 供应商编码。 */
    private String supplierCode;

    /** 供应商名称。 */
    private String supplierName;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 问题描述。 */
    private String issueDesc;

    /** 整改措施。 */
    private String rectifyAction;

    /** 责任人。 */
    private String responsible;

    /** 计划完成日期。 */
    private LocalDate planDate;

    /** 实际完成日期。 */
    private LocalDate completeDate;

    /** 验证人。 */
    private String verifyBy;

    /** 验证日期。 */
    private LocalDate verifyDate;

    /** 验证结论。 */
    private String verifyResult;

    /** 整改状态，为空默认 PENDING。 */
    private String rectificationStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
