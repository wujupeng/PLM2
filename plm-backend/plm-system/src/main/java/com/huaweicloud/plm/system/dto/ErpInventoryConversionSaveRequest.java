package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 形态转换单保存请求（对应 WBS T027 库存核算、T097 库存业务，属 G3 ERP）。
 */
@Data
public class ErpInventoryConversionSaveRequest {

    /** 转换单号（为空时自动生成）。 */
    private String conversionNo;

    /** 转换类型，为空默认 SPLIT。 */
    private String conversionType;

    /** 源物料编码。 */
    @NotBlank(message = "源物料编码不能为空")
    private String sourceMaterialCode;

    /** 源物料名称。 */
    private String sourceMaterialName;

    /** 源物料规格。 */
    private String sourceSpec;

    /** 源计量单位，为空默认 PCS。 */
    private String sourceUom;

    /** 源数量，为空默认 0。 */
    private BigDecimal sourceQty;

    /** 源批次号，为空默认空字符串。 */
    private String sourceBatchNo;

    /** 目标物料编码。 */
    @NotBlank(message = "目标物料编码不能为空")
    private String targetMaterialCode;

    /** 目标物料名称。 */
    private String targetMaterialName;

    /** 目标物料规格。 */
    private String targetSpec;

    /** 目标计量单位，为空默认 PCS。 */
    private String targetUom;

    /** 目标数量，为空默认 0。 */
    private BigDecimal targetQty;

    /** 仓库编码。 */
    private String warehouseCode;

    /** 转换人。 */
    private String conversionBy;

    /** 转换日期。 */
    private LocalDateTime conversionDate;

    /** 转换状态，为空默认 DRAFT。 */
    private String conversionStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
