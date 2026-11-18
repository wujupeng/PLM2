package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/** 采集数据记录（含时间戳与校验结果）。 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("mes_collect_record")
public class MesCollectRecord extends BaseEntity {

    /** 采集数据编号。 */
    private String recordNo;

    /** 设备编码。 */
    private String deviceCode;

    /** 采集接口编号。 */
    private String interfaceNo;

    /** 数据点编码。 */
    private String pointCode;

    /** 采集值。 */
    private String collectValue;

    /** 数据类型。 */
    private String dataType;

    /** 计量单位。 */
    private String uom;

    /** 采集时间（时间戳）。 */
    private LocalDateTime collectTime;

    /** 接收时间。 */
    private LocalDateTime receiveTime;

    /** 数据质量标识，默认 VALID。 */
    private String qualityFlag;

    /** 校验状态，默认 PENDING。 */
    private String validateStatus;

    /** 校验信息。 */
    private String validateMessage;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
