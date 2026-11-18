package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 文档分享：内部分享给指定用户/部门，或生成可撤销的链接分享，支持有效期与下载控制。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_doc_share")
public class OaDocShare extends BaseEntity {

    private String shareNo;

    private Long docId;

    /** 分享方式：INTERNAL/LINK。 */
    private String shareType;

    private Long targetUserId;

    private Long targetDeptId;

    private String permissionLevel;

    private Integer downloadAllowed;

    private LocalDateTime expireAt;

    private Integer revokedFlag;

    private Long viewCount;

    private String remark;
}
