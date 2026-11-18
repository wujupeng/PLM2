package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 变更确认保存请求（对应变更确认）。
 */
@Data
public class SrmPoChangeSaveRequest {

    /** 变更编号（为空时自动生成）。 */
    private String changeNo;

    /** 采购订单号。 */
    @NotBlank(message = "采购订单号不能为空")
    private String poNo;

    /** 供应商编码。 */
    private String supplierCode;

    /** 供应商名称。 */
    private String supplierName;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格型号。 */
    private String spec;

    /** 变更类型，为空默认 QTY。 */
    private String changeType;

    /** 变更前数量。 */
    private BigDecimal beforeQty;

    /** 变更后数量。 */
    private BigDecimal afterQty;

    /** 变更前交期。 */
    private LocalDate beforeDate;

    /** 变更后交期。 */
    private LocalDate afterDate;

    /** 变更前价格。 */
    private BigDecimal beforePrice;

    /** 变更后价格。 */
    private BigDecimal afterPrice;

    /** 变更原因。 */
    private String changeReason;

    /** 申请人。 */
    private String applyBy;

    /** 申请日期。 */
    private LocalDate applyDate;

    /** 确认人。 */
    private String confirmBy;

    /** 确认日期。 */
    private LocalDate confirmDate;

    /** 变更状态，为空默认 PENDING。 */
    private String changeStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
