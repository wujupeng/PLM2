package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 收货单保存请求（对应收货单）。
 */
@Data
public class WmsReceiptSaveRequest {

    /** 收货单号（为空时自动生成）。 */
    private String receiptNo;

    /** 收货通知单号。 */
    private String asnNo;

    /** 供应商编码。 */
    @NotBlank(message = "供应商编码不能为空")
    private String supplierCode;

    /** 供应商名称。 */
    private String supplierName;

    /** 仓库编码。 */
    private String warehouseCode;

    /** 收货方式，为空默认 SCAN。 */
    private String receiveType;

    /** 收货时间。 */
    private LocalDateTime receiveTime;

    /** 收货人。 */
    private String operator;

    /** 收货数量。 */
    private BigDecimal totalQty;

    /** 检验数量。 */
    private BigDecimal inspectedQty;

    /** 合格数量。 */
    private BigDecimal qualifiedQty;

    /** 拒收数量。 */
    private BigDecimal rejectedQty;

    /** 收货状态，为空默认 PENDING。 */
    private String receiveStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
