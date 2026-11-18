package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 参数配方。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("mes_recipe")
public class MesRecipe extends BaseEntity {

    /** 配方单号。 */
    private String recipeNo;

    /** 配方名称。 */
    private String recipeName;

    /** 工艺编码。 */
    private String processCode;

    /** 物料编码。 */
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

    /** 配方状态，默认 DRAFT。 */
    private String recipeStatus;

    /** 生效日期。 */
    private LocalDateTime effectiveDate;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
