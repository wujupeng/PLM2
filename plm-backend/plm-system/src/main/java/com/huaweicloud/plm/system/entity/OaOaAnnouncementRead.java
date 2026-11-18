package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 公告阅读确认：公告已读回执记录。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_oa_announcement_read")
public class OaOaAnnouncementRead extends BaseEntity {

    private Long announcementId;

    private Long userId;

    private String userName;

    private LocalDateTime readAt;
}
