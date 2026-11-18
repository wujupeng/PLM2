package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 物料分页查询条件。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class MaterialQuery extends PageQuery {

    /** 物料分类编码。 */
    private String categoryCode;

    /** 生命周期状态。 */
    private String lifecycleStatus;

    /** 来源类型：make/buy。 */
    private String sourceType;

    /** 物料类型：part/raw/consumable。 */
    private String materialType;
}
