package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * PLC/网关采集接口记录分页查询条件。
 * keyword 匹配 interfaceNo/interfaceName/deviceCode/endpoint。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class MesCollectInterfaceQuery extends PageQuery {

    /** 接口状态。 */
    private String interfaceStatus;

    /** 通讯协议。 */
    private String protocol;

    /** 设备编码。 */
    private String deviceCode;
}
