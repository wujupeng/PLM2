package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 标签模板分页查询条件。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class LabelTemplateQuery extends PageQuery {

    /** 模板编码。 */
    private String templateCode;

    /** 模板名称。 */
    private String templateName;

    /** 标签类型。 */
    private String labelType;

    /** 状态。 */
    private String status;
}
