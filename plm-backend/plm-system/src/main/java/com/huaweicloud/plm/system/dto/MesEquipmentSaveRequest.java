package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 设备台账保存请求。
 */
@Data
public class MesEquipmentSaveRequest {

    /** 设备编号（为空时自动生成）。 */
    private String equipmentNo;

    /** 设备名称。 */
    @NotBlank(message = "设备名称不能为空")
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

    /** 设备状态，为空默认 IDLE。 */
    private String equipmentStatus;

    /** 设备负责人。 */
    private String manager;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
