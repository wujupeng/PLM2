package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_application")
public class SysApplication extends BaseEntity {

    private String appCode;

    private String appName;

    /** 应用类型：INTERNAL/EXTERNAL/SAAS/TOOL。 */
    private String appType;

    private String entryUrl;

    private String icon;

    private String appCategory;

    /** 可见范围：ALL=全员，ORG=指定部门，ROLE=指定角色。 */
    private String visibleScope;

    /** 1=已接入 SSO，0=未接入。 */
    private Integer ssoEnabled;

    private Integer sortNo;

    /** enabled / disabled。 */
    private String status;

    private String owner;

    private String description;

    private String remark;
}
