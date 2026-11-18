package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 语言区域（OA-DEV-084）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_i18n_locale")
public class OaI18nLocale extends BaseEntity {

    /** 区域代码。 */
    private String localeCode;

    /** 区域名称。 */
    private String localeName;

    /** 语言代码。 */
    private String languageCode;

    /** 国家代码。 */
    private String countryCode;

    /** 时区。 */
    private String timezone;

    /** 日期格式。 */
    private String dateFormat;

    /** 时间格式。 */
    private String timeFormat;

    /** 数字格式。 */
    private String numberFormat;

    /** 币种代码。 */
    private String currencyCode;

    /** 是否默认：0 否，1 是。 */
    private Integer isDefault;

    /** 状态：0 停用，1 启用。 */
    private Integer status;

    /** 备注。 */
    private String remark;
}
