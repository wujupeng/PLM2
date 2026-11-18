package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * CAD 属性映射分页查询条件。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class CadAttrMappingQuery extends PageQuery {

    /** 目标实体。 */
    private String targetEntity;

    /** 状态：0-停用 1-启用。 */
    private Integer status;
}
