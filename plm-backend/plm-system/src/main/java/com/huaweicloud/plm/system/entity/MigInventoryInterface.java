package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 库存迁移集成接口记录：登记期初库存导入与账实核对对象的集成接口编号、名称、方向、
 * 对象类型、协议、端点、触发方式、同步模式、状态及组织信息，支撑集成接口配置管理。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("mig_inventory_interface")
public class MigInventoryInterface extends BaseEntity {

    /** 接口编号（唯一，为空时自动生成）。 */
    private String interfaceNo;

    /** 接口名称。 */
    private String interfaceName;

    /** 集成方向，默认 STOCK_MIGRATION。 */
    private String direction;

    /** 集成对象类型，默认 STOCK。 */
    private String objectType;

    /** 接口协议，默认 API。 */
    private String protocol;

    /** 接口端点地址。 */
    private String endpoint;

    /** 触发方式，默认 MANUAL。 */
    private String triggerType;

    /** 同步模式，默认 INCREMENTAL。 */
    private String syncMode;

    /** 接口状态，默认 DRAFT。 */
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
