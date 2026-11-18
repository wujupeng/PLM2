package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 异常安灯记录保存请求。
 */
@Data
public class MesKanbanAndonSaveRequest {

    /** 安灯单号（为空时自动生成）。 */
    private String andonNo;

    /** 产线编码。 */
    @NotBlank(message = "产线编码不能为空")
    private String lineCode;

    /** 工位编码。 */
    private String stationCode;

    /** 安灯类型，为空默认 EQUIPMENT。 */
    private String andonType;

    /** 安灯等级，为空默认 MEDIUM。 */
    private String andonLevel;

    /** 安灯状态，为空默认 TRIGGERED。 */
    private String andonStatus;

    /** 触发时间。 */
    private LocalDateTime triggerTime;

    /** 响应时间。 */
    private LocalDateTime responseTime;

    /** 关闭时间。 */
    private LocalDateTime closeTime;

    /** 触发人。 */
    private String triggerBy;

    /** 处理人。 */
    private String handler;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
