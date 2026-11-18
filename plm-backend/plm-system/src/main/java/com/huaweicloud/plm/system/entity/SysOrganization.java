package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_organization")
public class SysOrganization extends BaseEntity {

    private String orgCode;

    private String orgName;

    /** 顶级组织 parentId 为 0。 */
    private Long parentId;

    /** company=公司，department=部门，team=班组。 */
    private String orgType;

    private Integer sortNo;

    private Integer status;

    private String remark;
}
