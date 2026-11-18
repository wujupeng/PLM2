package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.system.entity.OaMailMessage;
import lombok.Data;

import java.util.List;

/** 邮件详情：正文 + 收件关系 + 附件 + 当前用户视角的读/星标/文件夹状态。 */
@Data
public class MailDetailResponse {

    private OaMailMessage message;

    private List<MailRecipientItem> recipients;

    private List<MailAttachmentItem> attachments;

    /** 当前用户视角的已读状态（发件人视角按已发送处理）。 */
    private Integer readFlag;

    private Integer starFlag;

    private String folderCode;
}
