package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 字段级权限保存请求（G1-N4 公共平台底座—身份与权限增强 WBS T008 权限审计）。
 */
@Data
public class SysFieldPermissionSaveRequest {

    /** 权限编号（为空时自动生成）。 */
    private String permNo;

    /** 角色编码。 */
    @NotBlank(message = "角色编码不能为空")
    private String roleCode;

    /** 业务模块：PLM/ERP/SRM/MES/WMS/OA。 */
    private String bizModule;

    /** 数据表。 */
    @NotBlank(message = "数据表不能为空")
    private String tableName;

    /** 字段名。 */
    @NotBlank(message = "字段名不能为空")
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

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
