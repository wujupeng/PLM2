package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 集成接口定义分页查询条件。
 * keyword 匹配 interfaceNo/interfaceName/endpoint。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class IntgSrmErpInterfaceQuery extends PageQuery {

    /** 集成对象类型。 */
    private String objectType;

    /** 接口协议。 */
    private String protocol;

    /** 接口状态。 */
    private String interfaceStatus;

    /** 集成方向。 */
    private String direction;
}
