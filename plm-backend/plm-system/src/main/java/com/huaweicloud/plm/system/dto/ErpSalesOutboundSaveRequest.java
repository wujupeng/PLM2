package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 销售出库保存请求（G3-N2 ERP 销售管理）。
 */
@Data
public class ErpSalesOutboundSaveRequest {

    /** 出库单号（为空时自动生成）。 */
    private String outboundNo;

    /** 关联发货单号。 */
    private String deliveryNo;

    /** 来源销售订单号。 */
    private String orderNo;

    /** 客户编码。 */
    @NotBlank(message = "客户编码不能为空")
    private String customerCode;

    /** 出库仓库编码。 */
    private String warehouseCode;

    /** 出库日期。 */
    private LocalDateTime outboundDate;

    /** 出库数量，为空默认 0。 */
    private BigDecimal outboundQty;

    /** 批次号。 */
    private String batchNo;

    /** 操作人。 */
    private String operatorName;

    /** 出库状态，为空默认 DRAFT。 */
    private String outboundStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
