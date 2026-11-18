package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

/**
 * 线边仓库存。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("wms_line_side_inventory")
public class WmsLineSideInventory extends BaseEntity {

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格。 */
    private String spec;

    /** 批次号。 */
    private String batchNo;

    /** 产线编码。 */
    private String lineCode;

    /** 线边库位编码。 */
    private String binCode;

    /** 仓库编码。 */
    private String warehouseCode;

    /** 库存数量。 */
    private BigDecimal qty;

    /** 可用数量。 */
    private BigDecimal availableQty;

    /** 冻结数量。 */
    private BigDecimal frozenQty;

    /** 最低库存数量。 */
    private BigDecimal minQty;

    /** 最高库存数量。 */
    private BigDecimal maxQty;

    /** 库存状态，默认 NORMAL。 */
    private String stockStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
