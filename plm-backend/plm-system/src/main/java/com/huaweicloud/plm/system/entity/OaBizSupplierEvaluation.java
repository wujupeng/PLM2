package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

/**
 * 供方考评（OA-DEV-068，月度/季度/年度）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_biz_supplier_evaluation")
public class OaBizSupplierEvaluation extends BaseEntity {

    /** 考评单号。 */
    private String evalNo;

    /** 考评周期：MONTH/QUARTER/YEAR 等。 */
    private String evalPeriod;

    private Integer evalYear;

    private Integer evalQuarter;

    private Integer evalMonth;

    private String supplierCode;

    private String supplierName;

    private Integer evalItemCount;

    private BigDecimal totalScore;

    private String grade;

    private String evalBasis;

    private String evalOpinion;

    private Long evaluatorUserId;

    private String evaluatorName;

    private Long orgId;

    private String orgName;

    private String attachmentJson;

    /** 考评状态：DRAFT/CONFIRMED 等。 */
    private String evalStatus;

    /** 流程状态：DRAFT/RUNNING/APPROVED/REJECTED/CANCELLED。 */
    private String flowStatus;

    private Long instanceId;

    private String instanceNo;

    private Integer cancelFlag;

    private String remark;
}
