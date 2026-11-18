package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * WMS 库存控制—库存批次：
 * 记录库存批次号、物料、仓库/库区/库位、供应商与收货单号、批次来源、生产/失效/入库日期、
 * 数量与可用/冻结数量及批次状态，支撑库存批次级追溯与库存控制。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("wms_inventory_batch")
public class WmsInventoryBatch extends BaseEntity {

    /** 库存批次号（为空时自动生成）。 */
    private String batchNo;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格型号。 */
    private String spec;

    /** 仓库编码。 */
    private String warehouseCode;

    /** 库区编码。 */
    private String zoneCode;

    /** 库位编码。 */
    private String binCode;

    /** 供应商编码。 */
    private String supplierCode;

    /** 收货单号。 */
    private String receiptNo;

    /** 批次来源，默认 PURCHASE。 */
    private String batchSource;

    /** 生产日期。 */
    private LocalDate productionDate;

    /** 失效日期。 */
    private LocalDate expiryDate;

    /** 入库日期。 */
    private LocalDate inboundDate;

    /** 数量。 */
    private BigDecimal qty;

    /** 可用数量。 */
    private BigDecimal availableQty;

    /** 冻结数量。 */
    private BigDecimal frozenQty;

    /** 批次状态，默认 NORMAL。 */
    private String batchStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
