package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * PLC/网关采集接口记录保存请求。
 */
@Data
public class MesCollectInterfaceSaveRequest {

    /** 采集接口编号（为空时自动生成）。 */
    private String interfaceNo;

    /** 接口名称。 */
    private String interfaceName;

    /** 设备编号。 */
    private String deviceNo;

    /** 设备编码。 */
    @NotBlank(message = "设备编码不能为空")
    private String deviceCode;

    /** 通讯协议。 */
    private String protocol;

    /** 接入地址。 */
    private String endpoint;

    /** 寄存器/点位地址。 */
    private String address;

    /** 数据格式。 */
    private String dataFormat;

    /** 采集频率（秒）。 */
    private Integer sampleInterval;

    /** 接口状态，为空默认 OFFLINE。 */
    private String interfaceStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
