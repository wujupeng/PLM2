package com.huaweicloud.plm.system.dto;

import java.time.LocalDate;
import lombok.Data;

/**
 * 5M 变更追踪保存入参（OA-DEV-072）。人机料法环变更需风险、验证证据与关闭条件完整。
 */
@Data
public class BizFiveMChangeSaveRequest {

    /** 变更类别：oa_five_m_category（MAN/MACHINE/MATERIAL/METHOD/ENVIRONMENT）。 */
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

    private String attachmentJson;

    private String remark;

    private Boolean submit;
}
