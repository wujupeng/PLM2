package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 生产建议保存请求（对应 WBS T025 需求计划、T095 LRP/MRP需求计划，属 G3 ERP）。
 */
@Data
public class ErpProductionSuggestionSaveRequest {

    /** 生产建议单号（为空时自动生成）。 */
    private String suggestionNo;

    /** 关联运算单号。 */
    private String runNo;

    /** 物料编码。 */
    @NotBlank(message = "物料编码不能为空")
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格。 */
    private String spec;

    /** 单位，为空默认 PCS。 */
    private String uom;

    /** 净需求，为空默认 0。 */
    private BigDecimal netQty;

    /** 建议生产数量，为空默认 0。 */
    private BigDecimal suggestQty;

    /** BOM 版本。 */
    private String bomVersion;

    /** 仓库编码。 */
    private String warehouseCode;

    /** 需求日期。 */
    private LocalDateTime requiredDate;

    /** 建议状态，为空默认 OPEN。 */
    private String suggestionStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
