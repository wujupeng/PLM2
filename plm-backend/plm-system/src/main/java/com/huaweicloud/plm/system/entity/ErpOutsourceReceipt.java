package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ERP 委外管理—委外到货单头（对应 WBS T024 委外管理、T094 委外加工闭环，属 G3 ERP）：
 * 记录委外到货的加工商、关联委外订单、到货日期、仓库与收货人、是否报检、状态与数量等主信息，
 * 明细行见 {@link ErpOutsourceReceiptLine}。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_outsource_receipt")
public class ErpOutsourceReceipt extends BaseEntity {

    /** 委外到货单号（唯一，支持人工指定，为空时自动生成）。 */
    private String receiptNo;

    /** 到货类型，默认 NORMAL。 */
    private String receiptType;

    /** 关联委外订单号。 */
    private String orderNo;

    /** 加工商编码。 */
    private String supplierCode;

    /** 加工商名称。 */
    private String supplierName;

    /** 到货日期。 */
    private LocalDateTime receiptDate;

    /** 仓库编码。 */
    private String warehouseCode;

    /** 是否报检，默认 1。 */
    private Integer inspectionRequired;

    /** 收货人。 */
    private String receiver;

    /** 到货单状态，默认 DRAFT。 */
    private String receiptStatus;

    /** 到货总数量，默认 0。 */
    private BigDecimal totalQty;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
