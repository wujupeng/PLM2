package com.huaweicloud.plm.system.dto;

import lombok.Data;

/**
 * 多工厂参数保存入参（OA-DEV-084）。
 */
@Data
public class BizFactoryParamSaveRequest {

    private String factoryCode;

    private String factoryName;

    private String countryCode;

    private String timezone;

    private String localeCode;

    private String paramKey;

    private String paramValue;

    private Integer status;

    private String remark;
}
