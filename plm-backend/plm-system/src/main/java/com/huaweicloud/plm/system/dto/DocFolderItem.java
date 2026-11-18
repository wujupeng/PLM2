package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class DocFolderItem {

    private Long id;

    private String folderCode;

    private String folderName;

    private String folderType;

    private Long parentId;

    private String folderPath;

    private Integer folderLevel;

    private Long ownerUserId;

    private Long ownerDeptId;

    private String categoryCode;

    private Integer sortNo;

    private String status;

    private String remark;

    /** 直接子目录数，用于前端展示与删除前校验。 */
    private Long childCount;

    /** 目录下文档数。 */
    private Long docCount;

    /** 当前用户在该目录的有效权限级别：READ/WRITE/MANAGE，无权限为空。 */
    private String effectivePermission;

    private LocalDateTime createdAt;

    /** 目录树子节点，仅树接口返回。 */
    private List<DocFolderItem> children;
}
