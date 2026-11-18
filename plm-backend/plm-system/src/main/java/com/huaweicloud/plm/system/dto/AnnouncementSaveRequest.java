package com.huaweicloud.plm.system.dto;

import java.time.LocalDateTime;
import lombok.Data;

/**
 * 公告保存入参。
 */
@Data
public class AnnouncementSaveRequest {

    private String title;

    private String category;

    private String content;

    private String publishScope;

    private String scopeValue;

    private String publishStatus;

    private LocalDateTime publishAt;

    private LocalDateTime expireAt;

    private Integer needReadFlag;

    private Integer topFlag;

    private String attachmentJson;

    private String remark;
}
