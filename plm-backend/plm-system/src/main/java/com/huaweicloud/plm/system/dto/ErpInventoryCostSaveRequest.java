package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 库存成本核算单保存请求（对应 WBS T027 库存核算、T097 库存业务，属 G3 ERP）。
 */
@Data
public class ErpInventoryCostSaveRequest {

    /** 成本核算单号（为空时自动生成）。 */
    private String costNo;

    /** 成本核算方法，为空默认 MOVING_AVG。 */
    private String costMethod;

    /** 期间（如 2026-11）。 */
    private String period;

    /** 物料编码。 */
    @NotBlank(message = "物料编码不能为空")
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格。 */
    private String spec;

    /** 单位，为空默认 PCS。 */
    private String uom;

    /** 仓库编码。 */
    private String warehouseCode;

    /** 期初数量，为空默认 0。 */
    private BigDecimal beginQty;

    /** 期初金额，为空默认 0。 */
    private BigDecimal beginAmount;

    /** 入库数量，为空默认 0。 */
    private BigDecimal inQty;

    /** 入库金额，为空默认 0。 */
    private BigDecimal inAmount;

    /** 出库数量，为空默认 0。 */
    private BigDecimal outQty;

    /** 出库金额，为空默认 0。 */
    private BigDecimal outAmount;

    /** 期末数量，为空默认 0。 */
    private BigDecimal endQty;

    /** 期末金额，为空默认 0。 */
    private BigDecimal endAmount;

    /** 平均成本，为空默认 0。 */
    private BigDecimal avgCost;

    /** 核算人。 */
    private String costBy;

    /** 核算日期。 */
    private LocalDateTime costDate;

    /** 核算状态，为空默认 DRAFT。 */
    private String costStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
