package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 移动端配置：移动端菜单、快捷入口等可配置项。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_mobile_config")
public class OaMobileConfig extends BaseEntity {

    /** 配置类型：MENU/QUICK_ENTRY/THEME/OTHER。 */
    private String configType;

    private String configKey;

    private String configName;

    private String configValue;

    private String icon;

    private Integer sortNo;

    /** 配置状态：ENABLED/DISABLED。 */
    private String configStatus;

    private String remark;
}
