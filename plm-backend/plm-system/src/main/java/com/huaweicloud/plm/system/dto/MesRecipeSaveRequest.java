package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 参数配方保存请求。
 */
@Data
public class MesRecipeSaveRequest {

    /** 配方单号（为空时自动生成）。 */
    private String recipeNo;

    /** 配方名称。 */
    private String recipeName;

    /** 工艺编码。 */
    private String processCode;

    /** 物料编码。 */
    @NotBlank(message = "物料编码不能为空")
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格。 */
    private String spec;

    /** 参数编码。 */
    private String paramCode;

    /** 参数名称。 */
    private String paramName;

    /** 参数值。 */
    private String paramValue;

    /** 参数单位。 */
    private String paramUnit;

    /** 上限值。 */
    private BigDecimal upperLimit;

    /** 下限值。 */
    private BigDecimal lowerLimit;

    /** 配方状态，为空默认 DRAFT。 */
    private String recipeStatus;

    /** 生效日期。 */
    private LocalDateTime effectiveDate;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
