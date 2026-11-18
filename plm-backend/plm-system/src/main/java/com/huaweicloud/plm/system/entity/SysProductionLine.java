package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 产线（G1-N5 公共平台底座—多组织多工厂 WBS T100）：
 * 承载生产执行主体，挂在工厂之下，登记车间、产线类型与小时产能，供各业务系统按产线维度隔离与汇总。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_production_line")
public class SysProductionLine extends BaseEntity {

    /** 产线编码（唯一，支持人工指定）。 */
    private String lineCode;

    /** 产线名称。 */
    private String lineName;

    /** 所属工厂编码。 */
    private String factoryCode;

    /** 车间。 */
    private String workshop;

    /** 产线类型：ASSEMBLY/MACHINING/PACKAGING/TESTING。 */
    private String lineType;

    /** 小时产能。 */
    private Integer capacityPerHour;

    /** 负责人。 */
    private String manager;

    /** 产线状态：ACTIVE/DISABLED。 */
    private String lineStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
