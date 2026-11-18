package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DocFolderSaveRequest {

    @NotBlank(message = "目录编码不能为空")
    private String folderCode;

    @NotBlank(message = "目录名称不能为空")
    private String folderName;

    /** 目录类型：PUBLIC/DEPARTMENT/PROJECT/PERSONAL/SHARED/ARCHIVE/KNOWLEDGE。 */
    private String folderType;

    /** 上级目录ID，根目录为 0。 */
    private Long parentId;

    private Long ownerDeptId;

    private String categoryCode;

    private Integer sortNo;

    private String status;

    private String remark;
}
