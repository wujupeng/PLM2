package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * PDA 设备保存请求（G1-N6 WBS T106 移动端与PDA）。
 */
@Data
public class MobileDeviceSaveRequest {

    /** 设备编号（为空时自动生成）。 */
    private String deviceNo;

    /** 设备名称。 */
    @NotBlank(message = "设备名称不能为空")
    private String deviceName;

    /** 设备类型：PDA/PHONE/SCANNER/TABLET，为空默认 PDA。 */
    private String deviceType;

    /** 设备型号。 */
    private String deviceModel;

    /** 设备状态：ACTIVE/OFFLINE/DISABLED，为空默认 ACTIVE。 */
    private String deviceStatus;

    /** 绑定用户ID。 */
    private Long bindUserId;

    /** 绑定用户名称。 */
    private String bindUserName;

    /** 最近活跃时间。 */
    private LocalDateTime lastActiveTime;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
