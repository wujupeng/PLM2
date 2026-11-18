package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 采集数据点记录分页查询条件。
 * keyword 匹配 pointNo/pointCode/pointName/interfaceNo。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class MesCollectPointQuery extends PageQuery {

    /** 数据点状态。 */
    private String pointStatus;

    /** 数据类型。 */
    private String dataType;

    /** 采集接口编号。 */
    private String interfaceNo;

    /** 设备编码。 */
    private String deviceCode;
}
