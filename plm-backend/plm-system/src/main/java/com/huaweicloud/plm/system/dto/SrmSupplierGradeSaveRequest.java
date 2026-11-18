package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 供应商分级保存请求（对应 SRM 供应商管理—供应商分级）。
 */
@Data
public class SrmSupplierGradeSaveRequest {

    /** 分级单号（为空时自动生成）。 */
    private String gradeNo;

    /** 供应商编码。 */
    private String supplierCode;

    /** 供应商名称。 */
    private String supplierName;

    /** 分级等级，为空默认 C。 */
    private String gradeLevel;

    /** 分级周期。 */
    private String gradePeriod;

    /** 分级评分。 */
    private BigDecimal gradeScore;

    /** 分级依据。 */
    private String gradeBasis;

    /** 评价人。 */
    private String evaluator;

    /** 评级日期。 */
    private LocalDate gradeDate;

    /** 分级状态，为空默认 DRAFT。 */
    private String gradeStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
