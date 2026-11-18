package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.FieldStrategy;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 收件关系：一封邮件对每个收件人各一行，读、星标、删除与文件夹状态均按收件人独立维护。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_mail_recipient")
public class OaMailRecipient extends BaseEntity {

    private Long messageId;

    private Long recipientUserId;

    private String recipientName;

    /** 收件类型：TO=收件人，CC=抄送，BCC=密送。 */
    private String recipientType;

    private Integer readFlag;

    /** 标记为未读时需要置空，故声明为始终更新。 */
    @TableField(updateStrategy = FieldStrategy.ALWAYS)
    private LocalDateTime readAt;

    private Integer starFlag;

    private Integer deletedFlag;

    /** 所属文件夹：INBOX/TRASH 或自定义文件夹编码。 */
    private String folderCode;

    private String remark;
}
