package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 交期承诺保存请求（对应交期承诺）。
 */
@Data
public class SrmDeliveryCommitmentSaveRequest {

    /** 交期承诺编号（为空时自动生成）。 */
    private String commitmentNo;

    /** 订单确认单号。 */
    private String confirmNo;

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

    /** 承诺数量。 */
    private BigDecimal commitmentQty;

    /** 单位。 */
    private String unit;

    /** 需求日期。 */
    private LocalDate requireDate;

    /** 承诺日期。 */
    private LocalDate promiseDate;

    /** 延期天数。 */
    private Integer delayDays;

    /** 延期原因。 */
    private String delayReason;

    /** 承诺人。 */
    private String commitBy;

    /** 承诺日期（登记）。 */
    private LocalDate commitDate;

    /** 承诺状态，为空默认 PENDING。 */
    private String commitmentStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
