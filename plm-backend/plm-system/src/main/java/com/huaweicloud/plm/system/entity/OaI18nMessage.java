package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 语言包条目（OA-DEV-084）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_i18n_message")
public class OaI18nMessage extends BaseEntity {

    /** 区域代码。 */
    private String localeCode;

    /** 消息键。 */
    private String messageKey;

    /** 消息内容。 */
    private String messageValue;

    /** 所属模块。 */
    private String module;

    /** 备注。 */
    private String remark;
}
