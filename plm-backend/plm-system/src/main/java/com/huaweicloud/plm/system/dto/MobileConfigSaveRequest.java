package com.huaweicloud.plm.system.dto;

import lombok.Data;

/**
 * 移动端配置保存入参。
 */
@Data
public class MobileConfigSaveRequest {

    private String configType;

    private String configKey;

    private String configName;

    private String configValue;

    private String icon;

    private Integer sortNo;

    private String configStatus;

    private String remark;
}
