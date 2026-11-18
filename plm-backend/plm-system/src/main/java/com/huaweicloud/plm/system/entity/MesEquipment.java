package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * MES 设备台账。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("mes_equipment")
public class MesEquipment extends BaseEntity {

    /** 设备编号。 */
    private String equipmentNo;

    /** 设备名称。 */
    private String equipmentName;

    /** 设备类型。 */
    private String equipmentType;

    /** 设备型号。 */
    private String model;

    /** 规格。 */
    private String spec;

    /** 制造商。 */
    private String manufacturer;

    /** 车间编码。 */
    private String workshopCode;

    /** 产线编码。 */
    private String lineCode;

    /** 安装位置。 */
    private String location;

    /** 采购日期。 */
    private LocalDateTime purchaseDate;

    /** 安装日期。 */
    private LocalDateTime installDate;

    /** 质保截止日期。 */
    private LocalDateTime warrantyEndDate;

    /** 设备状态，默认 IDLE。 */
    private String equipmentStatus;

    /** 设备负责人。 */
    private String manager;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
