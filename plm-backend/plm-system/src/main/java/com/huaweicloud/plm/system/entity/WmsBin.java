package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

/**
 * WMS 仓储基础—库位管理：登记库位编码、名称、所属仓库与库区、库位类型、容量上限与已用容量、
 * 计量单位、条码、库位状态及组织信息，支撑库存上架、拣选的库位基础数据追溯。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("wms_bin")
public class WmsBin extends BaseEntity {

    /** 库位编码（为空时自动生成）。 */
    private String binCode;

    /** 库位名称。 */
    private String binName;

    /** 所属仓库编码。 */
    private String warehouseCode;

    /** 所属库区编码。 */
    private String zoneCode;

    /** 库位类型，默认 STORAGE。 */
    private String binType;

    /** 容量上限。 */
    private BigDecimal maxCapacity;

    /** 已用容量。 */
    private BigDecimal usedCapacity;

    /** 容量单位。 */
    private String capacityUnit;

    /** 条码。 */
    private String barcode;

    /** 库位状态，默认 IDLE。 */
    private String binStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
