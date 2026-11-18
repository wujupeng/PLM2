package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 库存余额保存请求（对应 WBS T027 库存核算、T097 库存业务，属 G3 ERP）。
 */
@Data
public class ErpInventoryBalanceSaveRequest {

    /** 物料编码。 */
    @NotBlank(message = "物料编码不能为空")
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格型号。 */
    private String spec;

    /** 计量单位，为空默认 PCS。 */
    private String uom;

    /** 仓库编码。 */
    @NotBlank(message = "仓库编码不能为空")
    private String warehouseCode;

    /** 仓库名称。 */
    private String warehouseName;

    /** 库位编码，为空默认空串。 */
    private String locationCode;

    /** 批次号，为空默认空串。 */
    private String batchNo;

    /** 现存量，为空默认 0。 */
    private BigDecimal onHandQty;

    /** 锁定量，为空默认 0。 */
    private BigDecimal lockedQty;

    /** 可用量，为空默认 0。 */
    private BigDecimal availableQty;

    /** 在途量，为空默认 0。 */
    private BigDecimal inTransitQty;

    /** 平均成本，为空默认 0。 */
    private BigDecimal avgCost;

    /** 库存金额，为空默认 0。 */
    private BigDecimal amount;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
