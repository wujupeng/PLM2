package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 销售发票保存请求（G3-N2 ERP 销售管理）。
 */
@Data
public class ErpSalesInvoiceSaveRequest {

    /** 发票单编号（为空时自动生成）。 */
    private String invoiceNo;

    /** 发票类型，为空默认 SPECIAL。 */
    private String invoiceType;

    /** 发票代码。 */
    private String invoiceCode;

    /** 关联销售订单编号。 */
    private String orderNo;

    /** 关联发货单编号。 */
    private String deliveryNo;

    /** 客户编码。 */
    @NotBlank(message = "客户编码不能为空")
    private String customerCode;

    /** 客户名称。 */
    private String customerName;

    /** 开票日期。 */
    private LocalDateTime invoiceDate;

    /** 开票金额，为空默认 0。 */
    private BigDecimal invoiceAmount;

    /** 税率，为空默认 0。 */
    private BigDecimal taxRate;

    /** 税额，为空默认 0。 */
    private BigDecimal taxAmount;

    /** 不含税金额，为空默认 0。 */
    private BigDecimal netAmount;

    /** 发票状态，为空默认 DRAFT。 */
    private String invoiceStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
