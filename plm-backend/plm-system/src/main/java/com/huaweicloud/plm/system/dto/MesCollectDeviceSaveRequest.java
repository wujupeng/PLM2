package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 采集设备记录保存请求。
 */
@Data
public class MesCollectDeviceSaveRequest {

    /** 采集设备编号（为空时自动生成）。 */
    private String deviceNo;

    /** 设备编码。 */
    @NotBlank(message = "设备编码不能为空")
    private String deviceCode;

    /** 设备名称。 */
    private String deviceName;

    /** 设备类型，为空默认 TEST。 */
    private String deviceType;

    /** 型号。 */
    private String model;

    /** 厂商。 */
    private String vendor;

    /** 通讯协议。 */
    private String protocol;

    /** IP 地址。 */
    private String ipAddress;

    /** 端口。 */
    private Integer port;

    /** 网关编码。 */
    private String gatewayCode;

    /** 安装位置。 */
    private String location;

    /** 设备状态，为空默认 OFFLINE。 */
    private String deviceStatus;

    /** 安装日期。 */
    private LocalDateTime installDate;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
