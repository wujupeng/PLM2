package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 采购到货单头保存请求（G3-N3a ERP 采购管理）。
 */
@Data
public class ErpGoodsReceiptSaveRequest {

    /** 到货单号（为空时自动生成）。 */
    private String receiptNo;

    /** 到货类型，为空默认 NORMAL。 */
    private String receiptType;

    /** 采购订单编号。 */
    private String orderNo;

    /** 供应商编码。 */
    @NotBlank(message = "供应商编码不能为空")
    private String supplierCode;

    /** 供应商名称。 */
    private String supplierName;

    /** 到货日期。 */
    private LocalDateTime receiptDate;

    /** 仓库编码。 */
    private String warehouseCode;

    /** 是否需报检（0 免检 / 1 需报检），为空默认 1。 */
    private Integer inspectionRequired;

    /** 收货人。 */
    private String receiver;

    /** 到货单状态，为空默认 DRAFT。 */
    private String receiptStatus;

    /** 到货总数量，为空默认 0。 */
    private BigDecimal totalQty;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
