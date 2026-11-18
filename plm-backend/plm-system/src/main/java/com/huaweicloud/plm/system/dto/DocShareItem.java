package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 文档分享展示项：包含授权对象显示名、有效期与撤销状态。
 */
@Data
public class DocShareItem {

    private Long id;

    private String shareNo;

    private Long docId;

    /** 分享方式：INTERNAL/LINK。 */
    private String shareType;

    private Long targetUserId;

    private String targetUserName;

    private Long targetDeptId;

    private String targetDeptName;

    private String permissionLevel;

    private Integer downloadAllowed;

    private LocalDateTime expireAt;

    private Integer revokedFlag;

    private Long viewCount;

    /** 是否已过期（按当前时间计算）。 */
    private Boolean expired;

    private String remark;

    private Long createdBy;

    private LocalDateTime createdAt;
}
