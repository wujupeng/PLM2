package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 供应商准入保存请求（SRM 供应商准入）。
 */
@Data
public class SrmSupplierAdmissionSaveRequest {

    /** 准入单号（为空时自动生成）。 */
    private String admissionNo;

    /** 供应商编码。 */
    private String supplierCode;

    /** 供应商名称。 */
    private String supplierName;

    /** 准入类型，为空默认 NEW。 */
    private String admissionType;

    /** 准入来源。 */
    private String source;

    /** 申请人。 */
    private String applyBy;

    /** 申请日期。 */
    private LocalDate applyDate;

    /** 评审得分。 */
    private BigDecimal assessScore;

    /** 评审结论。 */
    private String assessConclusion;

    /** 审批人。 */
    private String approver;

    /** 审批日期。 */
    private LocalDate approveDate;

    /** 准入状态，为空默认 DRAFT。 */
    private String admissionStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
