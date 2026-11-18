package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

/**
 * ERP 库存核算—库存调拨行（对应 WBS T027 库存核算、T097 库存业务，属 G3 ERP）：
 * 记录库存调拨行的物料、批次、调出/调入库位与调拨数量等信息，
 * 隶属库存调拨头 {@link ErpInventoryTransfer}。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_inventory_transfer_line")
public class ErpInventoryTransferLine extends BaseEntity {

    /** 所属库存调拨头 ID。 */
    private Long transferId;

    /** 所属调拨单号（冗余，便于查询展示）。 */
    private String transferNo;

    /** 行号。 */
    private Integer lineNo;

    /** 行状态，默认 OPEN。 */
    private String lineStatus;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格型号。 */
    private String spec;

    /** 计量单位，默认 PCS。 */
    private String uom;

    /** 批次号，默认空串。 */
    private String batchNo;

    /** 调出库位编码，默认空串。 */
    private String fromLocationCode;

    /** 调入库位编码，默认空串。 */
    private String toLocationCode;

    /** 调拨数量，默认 0。 */
    private BigDecimal transferQty;

    /** 备注。 */
    private String remark;
}
