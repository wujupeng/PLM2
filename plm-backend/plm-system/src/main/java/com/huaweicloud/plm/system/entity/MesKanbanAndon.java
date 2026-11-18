package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 异常安灯记录。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("mes_kanban_andon")
public class MesKanbanAndon extends BaseEntity {

    /** 安灯单号。 */
    private String andonNo;

    /** 产线编码。 */
    private String lineCode;

    /** 工位编码。 */
    private String stationCode;

    /** 安灯类型，默认 EQUIPMENT。 */
    private String andonType;

    /** 安灯等级，默认 MEDIUM。 */
    private String andonLevel;

    /** 安灯状态，默认 TRIGGERED。 */
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

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
