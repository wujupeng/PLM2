package com.huaweicloud.plm.system.dto;

import lombok.Data;

/**
 * 国际化文案保存入参（OA-DEV-084）。
 */
@Data
public class BizI18nMessageSaveRequest {

    private String localeCode;

    private String messageKey;

    private String messageValue;

    private String module;

    private String remark;
}
