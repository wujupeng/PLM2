package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 采集设备（测试设备/仪器）记录。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("mes_collect_device")
public class MesCollectDevice extends BaseEntity {

    /** 采集设备编号。 */
    private String deviceNo;

    /** 设备编码。 */
    private String deviceCode;

    /** 设备名称。 */
    private String deviceName;

    /** 设备类型，默认 TEST。 */
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

    /** 设备状态，默认 OFFLINE。 */
    private String deviceStatus;

    /** 安装日期。 */
    private LocalDateTime installDate;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
