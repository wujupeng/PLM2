package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_permission")
public class SysPermission extends BaseEntity {

    private String permissionCode;

    private String permissionName;

    /** menu=菜单，button=按钮，api=接口。 */
    private String permissionType;

    /** 顶级权限 parentId 为 0。 */
    private Long parentId;

    /** 前端路由地址，仅菜单类型使用。 */
    private String path;

    private String icon;

    private Integer sortNo;

    private Integer status;

    private String remark;
}
