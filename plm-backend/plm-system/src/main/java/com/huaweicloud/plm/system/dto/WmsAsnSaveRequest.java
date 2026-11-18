package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 收货通知单保存请求（对应收货通知单）。
 */
@Data
public class WmsAsnSaveRequest {

    /** 收货通知单号（为空时自动生成）。 */
    private String asnNo;

    /** ASN 类型，为空默认 PURCHASE。 */
    private String asnType;

    /** 供应商编码。 */
    @NotBlank(message = "供应商编码不能为空")
    private String supplierCode;

    /** 供应商名称。 */
    private String supplierName;

    /** 采购/委外单号。 */
    private String poNo;

    /** 预计到货日期。 */
    private LocalDate expectedArrivalDate;

    /** 承运商。 */
    private String carrier;

    /** 收货仓库编码。 */
    private String warehouseCode;

    /** 通知数量。 */
    private BigDecimal totalQty;

    /** 已收数量。 */
    private BigDecimal receivedQty;

    /** ASN 状态，为空默认 DRAFT。 */
    private String asnStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
