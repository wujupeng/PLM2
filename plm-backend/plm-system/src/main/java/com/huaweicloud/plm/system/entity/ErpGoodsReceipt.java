package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ERP 采购管理—采购到货单头（G3-N3a ERP 采购管理）：
 * 记录采购到货的供应商、订单引用、仓库、是否需报检与状态等主信息，
 * 明细行见 {@link ErpGoodsReceiptLine}。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_goods_receipt")
public class ErpGoodsReceipt extends BaseEntity {

    /** 到货单号（唯一，支持人工指定，为空时自动生成）。 */
    private String receiptNo;

    /** 到货类型，默认 NORMAL。 */
    private String receiptType;

    /** 采购订单编号。 */
    private String orderNo;

    /** 供应商编码。 */
    private String supplierCode;

    /** 供应商名称。 */
    private String supplierName;

    /** 到货日期。 */
    private LocalDateTime receiptDate;

    /** 仓库编码。 */
    private String warehouseCode;

    /** 是否需报检（0 免检 / 1 需报检），默认 1。 */
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
