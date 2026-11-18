package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 工厂参数（OA-DEV-084）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_factory_param")
public class OaFactoryParam extends BaseEntity {

    /** 工厂编码。 */
    private String factoryCode;

    /** 工厂名称。 */
    private String factoryName;

    /** 国家代码。 */
    private String countryCode;

    /** 时区。 */
    private String timezone;

    /** 区域代码。 */
    private String localeCode;

    /** 参数键。 */
    private String paramKey;

    /** 参数值。 */
    private String paramValue;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 状态：0 停用，1 启用。 */
    private Integer status;

    /** 备注。 */
    private String remark;
}
