package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 职责分离规则（G1-N4 公共平台底座—身份与权限增强 WBS T008 权限审计）：
 * 登记互斥角色/权限对（如「采购下单」与「付款审批」），供权限审计复核与整改。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_sod_rule")
public class SysSodRule extends BaseEntity {

    /** 规则编号（唯一，支持人工指定）。 */
    private String ruleNo;

    /** 规则名称。 */
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

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
