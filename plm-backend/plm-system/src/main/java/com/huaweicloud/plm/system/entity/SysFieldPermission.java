package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 字段级权限（G1-N4 公共平台底座—身份与权限增强 WBS T008 权限审计）：
 * 在角色/权限之外按「业务模块 + 数据表 + 字段」配置可见性与脱敏级别，支撑数据权限细化到列。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_field_permission")
public class SysFieldPermission extends BaseEntity {

    /** 权限编号（唯一，支持人工指定）。 */
    private String permNo;

    /** 角色编码。 */
    private String roleCode;

    /** 业务模块：PLM/ERP/SRM/MES/WMS/OA。 */
    private String bizModule;

    /** 数据表。 */
    private String tableName;

    /** 字段名。 */
    private String fieldName;

    /** 字段标签。 */
    private String fieldLabel;

    /** 访问级别：HIDDEN/MASKED/READONLY/EDITABLE。 */
    private String accessLevel;

    /** 脱敏规则。 */
    private String maskRule;

    /** 权限状态：ACTIVE/DISABLED。 */
    private String permStatus;

    /** 描述。 */
    private String description;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
