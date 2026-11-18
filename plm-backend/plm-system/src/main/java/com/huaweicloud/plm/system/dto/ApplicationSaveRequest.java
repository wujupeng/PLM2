package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ApplicationSaveRequest {

    @NotBlank(message = "应用编码不能为空")
    private String appCode;

    @NotBlank(message = "应用名称不能为空")
    private String appName;

    private String appType;

    private String entryUrl;

    private String icon;

    private String appCategory;

    private String visibleScope;

    private Integer ssoEnabled;

    private Integer sortNo;

    private String status;

    private String owner;

    private String description;

    private String remark;
}
