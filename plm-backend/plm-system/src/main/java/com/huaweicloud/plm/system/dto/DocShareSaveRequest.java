package com.huaweicloud.plm.system.dto;

import lombok.Data;

/**
 * 文档分享入参：内部分享指定用户/部门，链接分享可设定有效期与下载开关。
 */
@Data
public class DocShareSaveRequest {

    /** 分享方式：INTERNAL/LINK，默认 INTERNAL。 */
    private String shareType;

    private Long targetUserId;

    private Long targetDeptId;

    /** 分享权限级别：READ/WRITE/MANAGE，默认 READ。 */
    private String permissionLevel;

    /** 是否允许下载：1 允许，0 禁止，默认 1。 */
    private Integer downloadAllowed;

    /** 有效期（天），不传时取可配置默认值 oa.doc.share.default.expire.days；传 0 表示不限制。 */
    private Integer expireDays;

    private String remark;
}
