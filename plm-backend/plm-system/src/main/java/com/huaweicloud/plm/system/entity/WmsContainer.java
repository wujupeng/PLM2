package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

/**
 * WMS 仓储基础—容器管理：登记容器编码、名称、类型、容量与单位、当前库位、条码及容器状态，
 * 支撑容器台账与流转追溯。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("wms_container")
public class WmsContainer extends BaseEntity {

    /** 容器编码（为空时自动生成）。 */
    private String containerCode;

    /** 容器名称。 */
    private String containerName;

    /** 容器类型，默认 PALLET。 */
    private String containerType;

    /** 容量。 */
    private BigDecimal capacity;

    /** 容量单位。 */
    private String capacityUnit;

    /** 当前库位编码。 */
    private String currentBinCode;

    /** 条码。 */
    private String barcode;

    /** 容器状态，默认 IDLE。 */
    private String containerStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
