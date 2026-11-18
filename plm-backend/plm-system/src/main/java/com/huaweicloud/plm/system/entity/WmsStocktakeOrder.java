package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 盘点单。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("wms_stocktake_order")
public class WmsStocktakeOrder extends BaseEntity {

    /** 盘点单号。 */
    private String stocktakeNo;

    /** 盘点类型，默认 CYCLE。 */
    private String stocktakeType;

    /** 仓库编码。 */
    private String warehouseCode;

    /** 库位编码。 */
    private String binCode;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格。 */
    private String spec;

    /** 批次号。 */
    private String batchNo;

    /** 账面数量。 */
    private BigDecimal bookQty;

    /** 实盘数量。 */
    private BigDecimal countedQty;

    /** 差异数量。 */
    private BigDecimal diffQty;

    /** 盘点状态，默认 DRAFT。 */
    private String stocktakeStatus;

    /** 盘点人。 */
    private String countBy;

    /** 盘点时间。 */
    private LocalDateTime countTime;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
