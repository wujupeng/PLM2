package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 设备点检记录保存请求。
 */
@Data
public class MesEquipmentCheckSaveRequest {

    /** 点检单号（为空时自动生成）。 */
    private String checkNo;

    /** 设备编码。 */
    @NotBlank(message = "设备编码不能为空")
    private String equipmentCode;

    /** 设备名称。 */
    private String equipmentName;

    /** 点检类型，为空默认 DAILY。 */
    private String checkType;

    /** 点检项目。 */
    private String checkItem;

    /** 点检结果，为空默认 PASS。 */
    private String checkResult;

    /** 点检状态，为空默认 PENDING。 */
    private String checkStatus;

    /** 点检人。 */
    private String inspector;

    /** 点检时间。 */
    private LocalDateTime checkTime;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
