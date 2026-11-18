package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class MailFolderSaveRequest {

    /** 文件夹编码，仅允许创建自定义文件夹时填写。 */
    @NotBlank(message = "文件夹编码不能为空")
    private String folderCode;

    @NotBlank(message = "文件夹名称不能为空")
    private String folderName;

    private Integer sortNo;

    private String remark;
}
