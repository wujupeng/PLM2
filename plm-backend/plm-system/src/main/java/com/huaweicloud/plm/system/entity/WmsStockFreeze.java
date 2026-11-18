package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 库存冻结（对应 WBS T047 库存控制）：
 * 登记物料在指定仓库/库位/批次上的冻结数量、原因与状态，支撑库存冻结追溯与释放。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("wms_stock_freeze")
public class WmsStockFreeze extends BaseEntity {

    /** 冻结单号（支持人工指定，为空时自动生成）。 */
    private String freezeNo;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 批次号。 */
    private String batchNo;

    /** 仓库编码。 */
    private String warehouseCode;

    /** 库位编码。 */
    private String binCode;

    /** 冻结数量。 */
    private BigDecimal freezeQty;

    /** 冻结类型，默认 FREEZE。 */
    private String freezeType;

    /** 冻结原因。 */
    private String freezeReason;

    /** 冻结状态，默认 FROZEN。 */
    private String freezeStatus;

    /** 申请人。 */
    private String applyBy;

    /** 申请时间。 */
    private LocalDateTime applyTime;

    /** 释放人。 */
    private String releaseBy;

    /** 释放时间。 */
    private LocalDateTime releaseTime;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
