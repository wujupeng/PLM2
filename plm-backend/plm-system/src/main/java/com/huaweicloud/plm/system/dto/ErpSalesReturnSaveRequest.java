package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 销售退货保存请求（G3-N2 ERP 销售管理）。
 */
@Data
public class ErpSalesReturnSaveRequest {

    /** 退货单编号（为空时自动生成）。 */
    private String returnNo;

    /** 关联销售订单编号。 */
    private String orderNo;

    /** 关联发货单编号。 */
    private String deliveryNo;

    /** 客户编码。 */
    @NotBlank(message = "客户编码不能为空")
    private String customerCode;

    /** 客户名称。 */
    private String customerName;

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
