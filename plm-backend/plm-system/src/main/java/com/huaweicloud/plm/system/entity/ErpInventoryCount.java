package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ERP 库存核算—库存盘点头（对应 WBS T027 库存核算、T097 库存业务，属 G3 ERP）：
 * 记录库存盘点的盘点仓库、盘点类型、经办人与盘点日期、合计差异数量及盘点状态，
 * 明细行见 {@link ErpInventoryCountLine}。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_inventory_count")
public class ErpInventoryCount extends BaseEntity {

    /** 盘点单号（唯一，为空时自动生成）。 */
    private String countNo;

    /** 盘点类型，默认 FULL。 */
    private String countType;

    /** 盘点仓库编码。 */
    private String warehouseCode;

    /** 盘点仓库名称。 */
    private String warehouseName;

    /** 经办人。 */
    private String countBy;

    /** 盘点日期。 */
    private LocalDateTime countDate;

    /** 合计差异数量，默认 0。 */
    private BigDecimal totalDiffQty;

    /** 盘点状态，默认 DRAFT。 */
    private String countStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
