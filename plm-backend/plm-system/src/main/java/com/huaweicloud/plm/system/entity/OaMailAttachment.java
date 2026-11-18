package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 邮件附件：上传时先落库（messageId 为空），发送邮件时再关联到邮件。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_mail_attachment")
public class OaMailAttachment extends BaseEntity {

    private Long messageId;

    private String fileName;

    private Long fileSize;

    private String contentType;

    /** 文件 SHA-256 摘要，用于同一邮件内附件去重与迁移核对。 */
    private String fileHash;

    private String storagePath;

    /** 扫描状态：PENDING=待扫描，CLEAN=安全，INFECTED=存在风险。 */
    private String scanStatus;

    private LocalDateTime scanAt;

    private Long uploadedByUserId;

    private String remark;
}
