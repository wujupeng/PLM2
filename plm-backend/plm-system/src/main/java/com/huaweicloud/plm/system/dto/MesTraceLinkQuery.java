package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 追溯关联分页查询条件。
 * keyword 匹配 linkNo/objectCode/linkCode/linkName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class MesTraceLinkQuery extends PageQuery {

    /** 对象类型。 */
    private String objectType;

    /** 关联类型。 */
    private String linkType;

    /** 对象编码。 */
    private String objectCode;

    /** 关联编码。 */
    private String linkCode;
}
