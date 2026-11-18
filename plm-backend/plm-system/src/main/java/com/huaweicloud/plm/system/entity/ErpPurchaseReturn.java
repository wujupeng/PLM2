package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ERP 采购管理—采购退货（G3-N3a ERP 采购管理）：
 * 记录不合格或商务退货所对应的采购订单、到货单、物料、退货数量与金额等信息，
 * 供采购、财务核对退货业务。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_purchase_return")
public class ErpPurchaseReturn extends BaseEntity {

    /** 退货单编号（唯一，支持人工指定，为空时自动生成）。 */
    private String returnNo;

    /** 关联采购订单编号。 */
    private String orderNo;

    /** 关联到货单编号。 */
    private String receiptNo;

    /** 供应商编码。 */
    private String supplierCode;

    /** 供应商名称。 */
    private String supplierName;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 退货日期。 */
    private LocalDateTime returnDate;

    /** 退货数量，默认 0。 */
    private BigDecimal returnQty;

    /** 退货原因。 */
    private String returnReason;

    /** 退货金额，默认 0。 */
    private BigDecimal returnAmount;

    /** 仓库编码。 */
    private String warehouseCode;

    /** 退货单状态，默认 DRAFT。 */
    private String returnStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
