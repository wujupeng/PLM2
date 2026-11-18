package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

/**
 * ERP 库存核算—库存余额（对应 WBS T027 库存核算、T097 库存业务，属 G3 ERP）：
 * 按物料/仓库/库位/批次登记收发存台账的期末数量与金额，支撑库存结存查询。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_inventory_balance")
public class ErpInventoryBalance extends BaseEntity {

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格型号。 */
    private String spec;

    /** 计量单位，默认 PCS。 */
    private String uom;

    /** 仓库编码。 */
    private String warehouseCode;

    /** 仓库名称。 */
    private String warehouseName;

    /** 库位编码，默认空串。 */
    private String locationCode;

    /** 批次号，默认空串。 */
    private String batchNo;

    /** 现存量，默认 0。 */
    private BigDecimal onHandQty;

    /** 锁定量，默认 0。 */
    private BigDecimal lockedQty;

    /** 可用量，默认 0。 */
    private BigDecimal availableQty;

    /** 在途量，默认 0。 */
    private BigDecimal inTransitQty;

    /** 平均成本，默认 0。 */
    private BigDecimal avgCost;

    /** 库存金额，默认 0。 */
    private BigDecimal amount;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
