package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 采集设备记录分页查询条件。
 * keyword 匹配 deviceNo/deviceCode/deviceName/gatewayCode。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class MesCollectDeviceQuery extends PageQuery {

    /** 设备类型。 */
    private String deviceType;

    /** 设备状态。 */
    private String deviceStatus;

    /** 通讯协议。 */
    private String protocol;

    /** 设备编码。 */
    private String deviceCode;
}
