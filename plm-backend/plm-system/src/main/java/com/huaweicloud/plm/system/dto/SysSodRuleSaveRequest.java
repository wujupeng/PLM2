package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 职责分离规则保存请求（G1-N4 公共平台底座—身份与权限增强 WBS T008 权限审计）。
 */
@Data
public class SysSodRuleSaveRequest {

    /** 规则编号（为空时自动生成）。 */
    private String ruleNo;

    /** 规则名称。 */
    @NotBlank(message = "规则名称不能为空")
    private String ruleName;

    /** 业务模块：PLM/ERP/SRM/MES/WMS/OA。 */
    private String bizModule;

    /** 互斥角色A。 */
    private String conflictRoleA;

    /** 互斥角色B。 */
    private String conflictRoleB;

    /** 互斥权限A。 */
    private String conflictPermA;

    /** 互斥权限B。 */
    private String conflictPermB;

    /** 风险级别：HIGH/MEDIUM/LOW。 */
    private String riskLevel;

    /** 规则状态：ACTIVE/DISABLED。 */
    private String ruleStatus;

    /** 描述。 */
    private String description;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
