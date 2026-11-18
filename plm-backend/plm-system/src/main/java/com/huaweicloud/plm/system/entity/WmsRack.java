package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

/**
 * WMS 基础数据—货架管理：登记货架编码、名称、所属仓库与库区、货架类型、
 * 层数与货位数、最大承重、条码及货架状态，支撑仓储货架基础数据维护与追溯。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("wms_rack")
public class WmsRack extends BaseEntity {

    /** 货架编码（为空时自动生成）。 */
    private String rackCode;

    /** 货架名称。 */
    private String rackName;

    /** 仓库编码。 */
    private String warehouseCode;

    /** 库区编码。 */
    private String zoneCode;

    /** 货架类型。 */
    private String rackType;

    /** 层数。 */
    private Integer layerCount;

    /** 货位数。 */
    private Integer binCount;

    /** 最大承重。 */
    private BigDecimal maxLoad;

    /** 条码。 */
    private String barcode;

    /** 货架状态，默认 DRAFT。 */
    private String rackStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
