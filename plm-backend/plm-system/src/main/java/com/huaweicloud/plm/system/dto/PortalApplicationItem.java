package com.huaweicloud.plm.system.dto;

import lombok.Data;

@Data
public class PortalApplicationItem {

    private Long id;

    private String appCode;

    private String appName;

    private String appType;

    private String entryUrl;

    private String icon;

    private String appCategory;

    private Integer ssoEnabled;
}
