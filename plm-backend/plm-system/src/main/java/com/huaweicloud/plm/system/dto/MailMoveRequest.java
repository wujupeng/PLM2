package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class MailMoveRequest {

    /** 目标文件夹编码：INBOX/TRASH 或自定义文件夹编码。 */
    @NotBlank(message = "目标文件夹不能为空")
    private String folderCode;
}
