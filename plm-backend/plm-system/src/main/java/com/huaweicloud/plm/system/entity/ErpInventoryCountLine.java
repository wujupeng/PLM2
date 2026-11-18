package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

/**
 * ERP 库存核算—库存盘点行（对应 WBS T027 库存核算、T097 库存业务，属 G3 ERP）：
 * 记录库存盘点行的物料、批次、库位与账面/实盘/差异数量等信息，
 * 隶属库存盘点头 {@link ErpInventoryCount}。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_inventory_count_line")
public class ErpInventoryCountLine extends BaseEntity {

    /** 所属库存盘点头 ID。 */
    private Long countId;

    /** 所属盘点单号（冗余，便于查询展示）。 */
    private String countNo;

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

    /** 库位编码，默认空串。 */
    private String locationCode;

    /** 批次号，默认空串。 */
    private String batchNo;

    /** 账面数量，默认 0。 */
    private BigDecimal bookQty;

    /** 实盘数量，默认 0。 */
    private BigDecimal actualQty;

    /** 差异数量，默认 0。 */
    private BigDecimal diffQty;

    /** 备注。 */
    private String remark;
}
