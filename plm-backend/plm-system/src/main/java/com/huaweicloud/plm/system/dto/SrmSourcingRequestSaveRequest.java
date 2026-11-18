package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 采购需求寻源保存请求（对应采购需求寻源）。
 */
@Data
public class SrmSourcingRequestSaveRequest {

    /** 寻源单号（为空时自动生成）。 */
    private String sourcingNo;

    /** 寻源标题。 */
    @NotBlank(message = "寻源标题不能为空")
    private String sourcingTitle;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格型号。 */
    private String spec;

    /** 需求数量。 */
    private BigDecimal demandQty;

    /** 单位。 */
    private String unit;

    /** 需求日期。 */
    private LocalDate demandDate;

    /** 需求部门。 */
    private String demandDept;

    /** 申请人。 */
    private String applicant;

    /** 寻源方式，为空默认 RFQ。 */
    private String sourcingType;

    /** 预算金额。 */
    private BigDecimal budgetAmount;

    /** 币种，为空默认 CNY。 */
    private String currency;

    /** 状态，为空默认 DRAFT。 */
    private String sourcingStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
