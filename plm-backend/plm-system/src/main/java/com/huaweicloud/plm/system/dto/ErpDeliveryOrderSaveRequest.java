package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 发货单头保存请求（G3-N2 ERP 销售管理）。
 */
@Data
public class ErpDeliveryOrderSaveRequest {

    /** 发货单号（为空时自动生成）。 */
    private String deliveryNo;

    /** 发货类型，为空默认 NORMAL。 */
    private String deliveryType;

    /** 来源销售订单号。 */
    @NotBlank(message = "销售订单号不能为空")
    private String orderNo;

    /** 客户编码。 */
    @NotBlank(message = "客户编码不能为空")
    private String customerCode;

    /** 客户名称。 */
    private String customerName;

    /** 发货日期。 */
    private LocalDateTime deliveryDate;

    /** 发货仓库编码。 */
    private String warehouseCode;

    /** 收货地址。 */
    private String receiverAddress;

    /** 联系人。 */
    private String contact;

    /** 联系电话。 */
    private String phone;

    /** 承运商。 */
    private String carrier;

    /** 物流单号。 */
    private String trackingNo;

    /** 发货状态，为空默认 DRAFT。 */
    private String deliveryStatus;

    /** 发货总数量，为空默认 0。 */
    private BigDecimal totalQty;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
