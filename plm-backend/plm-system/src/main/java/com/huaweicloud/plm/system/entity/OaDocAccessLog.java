package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 文档访问审计：记录查看、预览、下载、编辑、删除、分享与恢复，作为验收与审计证据。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_doc_access_log")
public class OaDocAccessLog extends BaseEntity {

    private Long docId;

    private Long versionId;

    private Long folderId;

    private Long userId;

    private String userName;

    /** 访问动作：VIEW/PREVIEW/DOWNLOAD/EDIT/DELETE/SHARE/RESTORE。 */
    private String action;

    private String actionDetail;

    private String clientIp;

    private String userAgent;

    private LocalDateTime occurredAt;
}
