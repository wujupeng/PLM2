package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * WMS 仓储基础—库区：登记库区编码、库区名称、所属仓库、库区类型、温层类型、
 * 库区状态及组织信息，支撑仓储库区主数据管理。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("wms_zone")
public class WmsZone extends BaseEntity {

    /** 库区编码（为空时自动生成）。 */
    private String zoneCode;

    /** 库区名称。 */
    private String zoneName;

    /** 仓库编码。 */
    private String warehouseCode;

    /** 仓库名称。 */
    private String warehouseName;

    /** 库区类型。 */
    private String zoneType;

    /** 温层类型。 */
    private String temperatureType;

    /** 库区状态，默认 DRAFT。 */
    private String zoneStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
