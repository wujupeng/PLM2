package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class NotificationQuery extends PageQuery {

    /** 消息类型：WORKFLOW/ANNOUNCEMENT/SYSTEM/INTEGRATION/BUSINESS。 */
    private String messageType;

    /** 已读状态：0=未读，1=已读；留空表示不限。 */
    private Integer readFlag;

    /** 归档状态：0=未归档，1=已归档；留空表示不限。 */
    private Integer archivedFlag;

    private String channel;

    private String bizType;
}
