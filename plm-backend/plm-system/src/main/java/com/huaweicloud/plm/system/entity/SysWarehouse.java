package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 仓库（G1-N5 公共平台底座—多组织多工厂 WBS T100）：
 * 承载实物库存主体，挂在工厂之下，登记仓库类型、库位与容量，供各业务系统按仓库维度隔离与汇总。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_warehouse")
public class SysWarehouse extends BaseEntity {

    /** 仓库编码（唯一，支持人工指定）。 */
    private String warehouseCode;

    /** 仓库名称。 */
    private String warehouseName;

    /** 所属工厂编码。 */
    private String factoryCode;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 仓库类型：RAW/SEMI/FINISHED/SPARE/INTRANSIT。 */
    private String warehouseType;

    /** 库位。 */
    private String location;

    /** 容量。 */
    private Long capacity;

    /** 负责人。 */
    private String manager;

    /** 仓库状态：ACTIVE/DISABLED。 */
    private String warehouseStatus;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
