package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 盘点差异单。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("wms_stocktake_diff")
public class WmsStocktakeDiff extends BaseEntity {

    /** 差异单号。 */
    private String diffNo;

    /** 盘点单号。 */
    private String stocktakeNo;

    /** 差异类型，默认 PROFIT。 */
    private String diffType;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格。 */
    private String spec;

    /** 批次号。 */
    private String batchNo;

    /** 仓库编码。 */
    private String warehouseCode;

    /** 账面数量。 */
    private BigDecimal bookQty;

    /** 实盘数量。 */
    private BigDecimal countedQty;

    /** 差异数量。 */
    private BigDecimal diffQty;

    /** 差异原因。 */
    private String diffReason;

    /** 差异状态，默认 PENDING。 */
    private String diffStatus;

    /** 审批人。 */
    private String approveBy;

    /** 审批时间。 */
    private LocalDateTime approveTime;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
