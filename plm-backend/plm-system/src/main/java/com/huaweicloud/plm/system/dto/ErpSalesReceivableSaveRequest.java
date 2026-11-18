package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 应收账款保存请求（G3-N2 ERP 销售管理）。
 */
@Data
public class ErpSalesReceivableSaveRequest {

    /** 应收单编号（为空时自动生成）。 */
    private String arNo;

    /** 关联销售发票编号。 */
    private String invoiceNo;

    /** 关联销售订单编号。 */
    private String orderNo;

    /** 客户编码。 */
    @NotBlank(message = "客户编码不能为空")
    private String customerCode;

    /** 客户名称。 */
    private String customerName;

    /** 应收金额，为空默认 0。 */
    private BigDecimal arAmount;

    /** 已收金额，为空默认 0。 */
    private BigDecimal receivedAmount;

    /** 应收余额，为空默认 0。 */
    private BigDecimal arBalance;

    /** 到期日期。 */
    private LocalDateTime dueDate;

    /** 应收状态，为空默认 OPEN。 */
    private String arStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
