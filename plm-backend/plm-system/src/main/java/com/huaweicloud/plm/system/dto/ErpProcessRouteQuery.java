package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 工艺路线分页查询条件（对应 G3-N7b ERP 工艺资源—工艺路线）。
 * keyword 匹配 routeCode/routeName/materialCode/materialName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpProcessRouteQuery extends PageQuery {

    /** 路线类型。 */
    private String routeType;

    /** 路线状态。 */
    private String routeStatus;

    /** 物料编码。 */
    private String materialCode;
}
