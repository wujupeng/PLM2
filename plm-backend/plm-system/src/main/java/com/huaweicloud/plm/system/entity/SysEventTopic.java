package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 事件主题（G1-N1 集成平台 T009）：领域事件主题定义与载荷规范。
 * 消息治理以「事件主题 + 订阅 + 事件消息」为主干，主题声明领域事件、持久化与保留期限。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_event_topic")
public class SysEventTopic extends BaseEntity {

    /** 主题编码。 */
    private String topicCode;

    /** 主题名称。 */
    private String topicName;

    /** 所属领域。 */
    private String domain;

    /** 载荷规范（JSON Schema 文本）。 */
    private String payloadSchema;

    /** 是否持久化：1 是，0 否。 */
    private Integer persistent;

    /** 消息保留天数。 */
    private Integer retentionDays;

    /** 主题状态：DRAFT/ACTIVE/DISABLED。 */
    private String topicStatus;

    /** 责任人。 */
    private String ownerName;

    /** 主题说明。 */
    private String description;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
