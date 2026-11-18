package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 定点定标保存请求（对应定点定标单）。
 */
@Data
public class SrmAwardSaveRequest {

    /** 定点单号（为空时自动生成）。 */
    private String awardNo;

    /** 询价单号。 */
    private String rfqNo;

    /** 比价单号。 */
    private String compareNo;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格型号。 */
    private String spec;

    /** 定点类型，为空默认 SINGLE。 */
    private String awardType;

    /** 供应商编码。 */
    @NotBlank(message = "供应商编码不能为空")
    private String supplierCode;

    /** 供应商名称。 */
    private String supplierName;

    /** 定点数量。 */
    private BigDecimal awardQty;

    /** 单位。 */
    private String unit;

    /** 定点单价。 */
    private BigDecimal awardPrice;

    /** 定点金额。 */
    private BigDecimal awardAmount;

    /** 币种，为空默认 CNY。 */
    private String currency;

    /** 定点日期。 */
    private LocalDate awardDate;

    /** 定标人。 */
    private String awardBy;

    /** 审批人。 */
    private String approver;

    /** 审批日期。 */
    private LocalDate approveDate;

    /** 状态，为空默认 DRAFT。 */
    private String awardStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
