package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

/**
 * ERP 工艺资源—资源资料（对应 G3-N7b ERP 工艺资源）：
 * 登记设备/模具/工装/量具/人工等产能资源编码、类型、规格与产能，支撑产能资源维护。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_process_resource")
public class ErpProcessResource extends BaseEntity {

    /** 资源编码（用户指定）。 */
    private String resourceCode;

    /** 资源名称。 */
    private String resourceName;

    /** 资源类型，默认 MACHINE。 */
    private String resourceType;

    /** 规格型号。 */
    private String spec;

    /** 资源分组。 */
    private String resourceGroup;

    /** 工作中心。 */
    private String workCenter;

    /** 产能，默认 0。 */
    private BigDecimal capacity;

    /** 产能单位。 */
    private String capacityUnit;

    /** 计量单位。 */
    private String uom;

    /** 资源状态，默认 ACTIVE。 */
    private String resourceStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
