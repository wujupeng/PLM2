package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * PLC/网关采集接口记录。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("mes_collect_interface")
public class MesCollectInterface extends BaseEntity {

    /** 采集接口编号。 */
    private String interfaceNo;

    /** 接口名称。 */
    private String interfaceName;

    /** 设备编号。 */
    private String deviceNo;

    /** 设备编码。 */
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

    /** 接口状态，默认 OFFLINE。 */
    private String interfaceStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
