package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 公告与新闻：企业公告、新闻与通知发布内容。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_oa_announcement")
public class OaOaAnnouncement extends BaseEntity {

    private String announcementNo;

    private String title;

    /** 公告分类：ANNOUNCEMENT/NEWS/NOTICE。 */
    private String category;

    private String content;

    /** 发布范围：ALL/DEPARTMENT/USER。 */
    private String publishScope;

    private String scopeValue;

    /** 发布状态：DRAFT/PUBLISHED/OFFLINE。 */
    private String publishStatus;

    private LocalDateTime publishAt;

    private LocalDateTime expireAt;

    private Integer needReadFlag;

    private Integer topFlag;

    private Integer viewCount;

    private Long authorUserId;

    private String authorName;

    private String attachmentJson;

    private String remark;
}
