package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 库区分页查询条件（对应库区）。
 * keyword 匹配 zoneCode/zoneName/warehouseCode/warehouseName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class WmsZoneQuery extends PageQuery {

    /** 库区类型。 */
    private String zoneType;

    /** 库区状态。 */
    private String zoneStatus;

    /** 仓库编码。 */
    private String warehouseCode;
}
