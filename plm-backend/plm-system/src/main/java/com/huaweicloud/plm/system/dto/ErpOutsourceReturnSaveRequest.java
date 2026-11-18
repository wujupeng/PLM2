package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 委外退货单保存请求（对应 WBS T024/T094 委外加工闭环，属 G3 ERP）。
 */
@Data
public class ErpOutsourceReturnSaveRequest {

    /** 退货单号（为空时自动生成）。 */
    private String returnNo;

    /** 委外订单号。 */
    private String orderNo;

    /** 委外到货单号。 */
    private String receiptNo;

    /** 供应商编码。 */
    @NotBlank(message = "供应商编码不能为空")
    private String supplierCode;

    /** 供应商名称。 */
    private String supplierName;

    /** 物料编码。 */
    @NotBlank(message = "物料编码不能为空")
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 退货日期。 */
    private LocalDateTime returnDate;

    /** 退货数量，为空默认 0。 */
    private BigDecimal returnQty;

    /** 退货原因。 */
    private String returnReason;

    /** 退货金额，为空默认 0。 */
    private BigDecimal returnAmount;

    /** 仓库编码。 */
    private String warehouseCode;

    /** 退货单状态，为空默认 DRAFT。 */
    private String returnStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
