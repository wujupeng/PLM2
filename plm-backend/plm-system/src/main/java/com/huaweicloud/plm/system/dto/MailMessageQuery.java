package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class MailMessageQuery extends PageQuery {

    /** 文件夹编码：INBOX/SENT/DRAFT/TRASH/STARRED 或自定义文件夹编码。 */
    private String folderCode;

    /** 紧急程度：LOW/NORMAL/HIGH。 */
    private String priority;

    /** 已读状态：0=未读，1=已读；留空表示不限。 */
    private Integer readFlag;

    /** 星标状态：0=未星标，1=已星标；留空表示不限。 */
    private Integer starFlag;

    /** 发件人姓名或部门关键字。 */
    private String senderKeyword;

    /** 是否含附件：0=否，1=是；留空表示不限。 */
    private Integer hasAttachment;

    /** 发送日期起（yyyy-MM-dd）。 */
    private String startDate;

    /** 发送日期止（yyyy-MM-dd）。 */
    private String endDate;
}
