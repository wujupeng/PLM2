package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 物料业务档案保存请求（G3-N1 ERP 基础资料 WBS T021）。
 */
@Data
public class ErpMaterialSaveRequest {

    /** 物料档案编号（为空时自动生成）。 */
    private String materialNo;

    /** 物料编码。 */
    @NotBlank(message = "物料编码不能为空")
    private String materialCode;

    /** 物料名称。 */
    @NotBlank(message = "物料名称不能为空")
    private String materialName;

    /** 规格型号。 */
    private String spec;

    /** 物料组。 */
    private String materialGroup;

    /** 基本计量单位，为空默认 PCS。 */
    private String baseUom;

    /** 采购计量单位。 */
    private String purchaseUom;

    /** 销售计量单位。 */
    private String saleUom;

    /** 计价方式，为空默认 MOVING_AVG。 */
    private String valuationMethod;

    /** 默认仓库编码。 */
    private String defaultWarehouseCode;

    /** 默认税码。 */
    private String defaultTaxCode;

    /** 安全库存，为空默认 0。 */
    private BigDecimal safetyStock;

    /** 标准成本。 */
    private BigDecimal stdCost;

    /** 物料状态，为空默认 ACTIVE。 */
    private String materialStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
