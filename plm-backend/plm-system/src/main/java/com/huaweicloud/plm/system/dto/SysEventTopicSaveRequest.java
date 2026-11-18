package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 事件主题保存请求（G1-N1 集成平台 T009）。
 */
@Data
public class SysEventTopicSaveRequest {

    /** 主题编码（为空时自动生成）。 */
    private String topicCode;

    /** 主题名称。 */
    @NotBlank(message = "主题名称不能为空")
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

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
