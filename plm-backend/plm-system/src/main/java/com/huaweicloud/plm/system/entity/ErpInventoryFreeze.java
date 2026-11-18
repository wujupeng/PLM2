package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ERP 库存核算—库存冻结单（对应 WBS T027 库存核算、T097 库存业务，属 G3 ERP）：
 * 登记物料在指定仓库/库位/批次上的冻结数量、原因与状态，支撑库存冻结追溯与释放。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_inventory_freeze")
public class ErpInventoryFreeze extends BaseEntity {

    /** 冻结单号（唯一，支持人工指定，为空时自动生成）。 */
    private String freezeNo;

    /** 冻结类型，默认 MANUAL。 */
    private String freezeType;

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

    /** 库位编码，默认 ""。 */
    private String locationCode;

    /** 批次号，默认 ""。 */
    private String batchNo;

    /** 冻结数量，默认 0。 */
    private BigDecimal freezeQty;

    /** 冻结原因。 */
    private String freezeReason;

    /** 冻结人。 */
    private String freezeBy;

    /** 冻结日期。 */
    private LocalDateTime freezeDate;

    /** 解冻日期。 */
    private LocalDateTime unfreezeDate;

    /** 冻结状态，默认 FROZEN。 */
    private String freezeStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
