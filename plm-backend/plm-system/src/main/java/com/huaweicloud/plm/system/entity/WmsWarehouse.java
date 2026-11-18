package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

/**
 * 仓库管理：登记仓库编码、名称、类型、地址、负责人与联系方式、面积、
 * 仓库状态及所属组织，支撑仓库基础数据维护与追溯。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("wms_warehouse")
public class WmsWarehouse extends BaseEntity {

    /** 仓库编码（为空时自动生成）。 */
    private String warehouseCode;

    /** 仓库名称。 */
    private String warehouseName;

    /** 仓库类型，默认 FINISHED。 */
    private String warehouseType;

    /** 仓库地址。 */
    private String address;

    /** 负责人。 */
    private String manager;

    /** 联系电话。 */
    private String contactPhone;

    /** 面积。 */
    private BigDecimal area;

    /** 仓库状态，默认 DRAFT。 */
    private String warehouseStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
