package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 盘点单保存请求。
 */
@Data
public class WmsStocktakeOrderSaveRequest {

    /** 盘点单号（为空时自动生成）。 */
    private String stocktakeNo;

    /** 盘点类型，为空默认 CYCLE。 */
    private String stocktakeType;

    /** 仓库编码。 */
    private String warehouseCode;

    /** 库位编码。 */
    private String binCode;

    /** 物料编码。 */
    @NotBlank(message = "物料编码不能为空")
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

    /** 盘点状态，为空默认 DRAFT。 */
    private String stocktakeStatus;

    /** 盘点人。 */
    private String countBy;

    /** 盘点时间。 */
    private LocalDateTime countTime;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
