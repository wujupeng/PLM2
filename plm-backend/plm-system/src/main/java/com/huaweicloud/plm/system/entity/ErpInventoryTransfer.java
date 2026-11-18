package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ERP 库存核算—库存调拨头（对应 WBS T027 库存核算、T097 库存业务，属 G3 ERP）：
 * 记录库存调拨的调出/调入仓库、调拨类型、经办人与调拨日期、合计调拨数量及调拨状态，
 * 明细行见 {@link ErpInventoryTransferLine}。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_inventory_transfer")
public class ErpInventoryTransfer extends BaseEntity {

    /** 调拨单号（唯一，支持人工指定，为空时自动生成）。 */
    private String transferNo;

    /** 调拨类型，默认 DIRECT。 */
    private String transferType;

    /** 调出仓库编码。 */
    private String fromWarehouseCode;

    /** 调出仓库名称。 */
    private String fromWarehouseName;

    /** 调入仓库编码。 */
    private String toWarehouseCode;

    /** 调入仓库名称。 */
    private String toWarehouseName;

    /** 经办人。 */
    private String transferBy;

    /** 调拨日期。 */
    private LocalDateTime transferDate;

    /** 合计调拨数量，默认 0。 */
    private BigDecimal totalQty;

    /** 调拨状态，默认 DRAFT。 */
    private String transferStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
