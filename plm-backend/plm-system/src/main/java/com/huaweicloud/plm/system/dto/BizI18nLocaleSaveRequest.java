package com.huaweicloud.plm.system.dto;

import lombok.Data;

/**
 * 国际化区域保存入参（OA-DEV-084）。
 */
@Data
public class BizI18nLocaleSaveRequest {

    private String localeCode;

    private String localeName;

    private String languageCode;

    private String countryCode;

    private String timezone;

    private String dateFormat;

    private String timeFormat;

    private String numberFormat;

    private String currencyCode;

    /** 是否默认区域。 */
    private Boolean isDefault;

    private Integer status;

    private String remark;
}
