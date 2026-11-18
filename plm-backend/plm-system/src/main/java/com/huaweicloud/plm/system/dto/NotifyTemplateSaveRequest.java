package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class NotifyTemplateSaveRequest {

    @NotBlank(message = "模板编码不能为空")
    private String templateCode;

    @NotBlank(message = "模板名称不能为空")
    private String templateName;

    private String messageType;

    private String channel;

    private String titleTemplate;

    private String contentTemplate;

    private String variableJson;

    private String status;

    private String remark;
}
