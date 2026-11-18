package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

/** 消息中心群发请求：管理员向指定用户批量发送站内通知。 */
@Data
public class NotificationBroadcastRequest {

    @NotEmpty(message = "接收人不能为空")
    private List<Long> receiverUserIds;

    /** 消息类型：WORKFLOW/ANNOUNCEMENT/SYSTEM/INTEGRATION/BUSINESS。 */
    private String messageType;

    @NotBlank(message = "消息标题不能为空")
    private String title;

    private String content;

    private String linkUrl;

    private String priority;

    private String templateCode;

    private String channel;

    private String remark;
}
