package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 参数配方分页查询条件。
 * keyword 匹配 recipeNo/recipeName/processCode/materialCode。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class MesRecipeQuery extends PageQuery {

    /** 配方状态。 */
    private String recipeStatus;

    /** 工艺编码。 */
    private String processCode;

    /** 物料编码。 */
    private String materialCode;

    /** 参数编码。 */
    private String paramCode;
}
