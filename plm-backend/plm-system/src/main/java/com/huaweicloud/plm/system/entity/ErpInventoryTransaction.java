package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ERP 库存核算—库存流水（对应 WBS T027 库存核算、T097 库存业务，属 G3 ERP）：
 * 登记物料出入库明细，支撑库存收发存明细追溯。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_inventory_transaction")
public class ErpInventoryTransaction extends BaseEntity {

    /** 流水单号（唯一，支持人工指定，为空时自动生成）。 */
    private String transactionNo;

    /** 交易类型，默认 IN。 */
    private String transactionType;

    /** 业务类型，默认 MANUAL。 */
    private String bizType;

    /** 出入方向，默认 IN。 */
    private String direction;

    /** 来源单据号。 */
    private String bizNo;

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

    /** 库位编码，默认空串。 */
    private String locationCode;

    /** 批次号，默认空串。 */
    private String batchNo;

    /** 数量，默认 0。 */
    private BigDecimal qty;

    /** 单位成本，默认 0。 */
    private BigDecimal unitCost;

    /** 金额，默认 0。 */
    private BigDecimal amount;

    /** 交易日期。 */
    private LocalDateTime transactionDate;

    /** 操作人。 */
    private String operator;

    /** 交易状态，默认 POSTED。 */
    private String transactionStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
