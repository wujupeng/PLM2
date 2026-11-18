package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 订单确认保存请求（对应订单确认）。
 */
@Data
public class SrmPoConfirmationSaveRequest {

    /** 确认编号（为空时自动生成）。 */
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

    /** 订单数量。 */
    private BigDecimal poQty;

    /** 单位。 */
    private String unit;

    /** 订单单价。 */
    private BigDecimal unitPrice;

    /** 订单金额。 */
    private BigDecimal totalAmount;

    /** 币种，为空默认 CNY。 */
    private String currency;

    /** 采购订单日期。 */
    private LocalDate poDate;

    /** 需求日期。 */
    private LocalDate requireDate;

    /** 确认人。 */
    private String confirmBy;

    /** 确认日期。 */
    private LocalDate confirmDate;

    /** 确认状态，为空默认 PENDING。 */
    private String confirmStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
