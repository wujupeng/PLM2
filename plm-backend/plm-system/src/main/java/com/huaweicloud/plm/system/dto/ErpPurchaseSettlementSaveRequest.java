package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 采购结算保存请求（G3-N3a ERP 采购管理）。
 */
@Data
public class ErpPurchaseSettlementSaveRequest {

    /** 结算单编号（为空时自动生成）。 */
    private String settlementNo;

    /** 供应商编码。 */
    @NotBlank(message = "供应商编码不能为空")
    private String supplierCode;

    /** 供应商名称。 */
    private String supplierName;

    /** 关联采购订单编号。 */
    private String orderNo;

    /** 关联采购发票编号。 */
    private String invoiceNo;

    /** 结算日期。 */
    private LocalDateTime settlementDate;

    /** 结算金额，为空默认 0。 */
    private BigDecimal settlementAmount;

    /** 已付金额，为空默认 0。 */
    private BigDecimal paidAmount;

    /** 结算余额，为空默认 0。 */
    private BigDecimal settleBalance;

    /** 账期，为空默认 NET30。 */
    private String paymentTerm;

    /** 结算状态，为空默认 OPEN。 */
    private String settlementStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
