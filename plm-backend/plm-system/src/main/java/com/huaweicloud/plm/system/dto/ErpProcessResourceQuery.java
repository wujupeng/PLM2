package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 资源资料分页查询条件（对应 G3-N7b ERP 工艺资源）。
 * keyword 匹配 resourceCode/resourceName/workCenter/spec。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpProcessResourceQuery extends PageQuery {

    /** 资源类型。 */
    private String resourceType;

    /** 资源状态。 */
    private String resourceStatus;
}
