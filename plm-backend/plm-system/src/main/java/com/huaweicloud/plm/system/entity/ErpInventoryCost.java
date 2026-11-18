package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ERP 库存核算—库存成本核算单（对应 WBS T027 库存核算、T097 库存业务，属 G3 ERP）：
 * 按期间登记物料在指定仓库上的期初/入库/出库/期末数量与金额及平均成本，支撑库存成本核算。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_inventory_cost")
public class ErpInventoryCost extends BaseEntity {

    /** 成本核算单号（唯一，为空时自动生成）。 */
    private String costNo;

    /** 成本核算方法，默认 MOVING_AVG。 */
    private String costMethod;

    /** 期间（如 2026-11）。 */
    private String period;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格。 */
    private String spec;

    /** 单位，默认 PCS。 */
    private String uom;

    /** 仓库编码。 */
    private String warehouseCode;

    /** 期初数量，默认 0。 */
    private BigDecimal beginQty;

    /** 期初金额，默认 0。 */
    private BigDecimal beginAmount;

    /** 入库数量，默认 0。 */
    private BigDecimal inQty;

    /** 入库金额，默认 0。 */
    private BigDecimal inAmount;

    /** 出库数量，默认 0。 */
    private BigDecimal outQty;

    /** 出库金额，默认 0。 */
    private BigDecimal outAmount;

    /** 期末数量，默认 0。 */
    private BigDecimal endQty;

    /** 期末金额，默认 0。 */
    private BigDecimal endAmount;

    /** 平均成本，默认 0。 */
    private BigDecimal avgCost;

    /** 核算人。 */
    private String costBy;

    /** 核算日期。 */
    private LocalDateTime costDate;

    /** 核算状态，默认 DRAFT。 */
    private String costStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
