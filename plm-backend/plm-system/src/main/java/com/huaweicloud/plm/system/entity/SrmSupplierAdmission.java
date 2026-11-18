package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * SRM 供应商准入：
 * 登记准入单号、供应商信息、准入类型与来源、评审与审批结论、准入状态，
 * 支撑供应商准入评审与审批追溯。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("srm_supplier_admission")
public class SrmSupplierAdmission extends BaseEntity {

    /** 准入单号（唯一，为空时自动生成）。 */
    private String admissionNo;

    /** 供应商编码。 */
    private String supplierCode;

    /** 供应商名称。 */
    private String supplierName;

    /** 准入类型，默认 NEW。 */
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

    /** 准入状态，默认 DRAFT。 */
    private String admissionStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
