package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * G1-N4 身份与权限增强通用分页查询条件。
 * 各字段按业务对象选择性使用：mfaType/bindStatus（MFA 绑定）、verifyScene/verifyResult（MFA 校验日志）、
 * protocol/providerStatus（单点登录）、roleCode/accessLevel/permStatus/tableName（字段权限）、
 * riskLevel/ruleStatus/bizModule（职责分离规则）、riskLevel/handleStatus/username（违规记录）、
 * startDate/endDate（时间区间，作用于创建时间）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class IamQuery extends PageQuery {

    /** 认证方式：TOTP/SMS/EMAIL。 */
    private String mfaType;

    /** 绑定状态：PENDING/BOUND/UNBOUND/DISABLED。 */
    private String bindStatus;

    /** 校验场景：LOGIN/SENSITIVE_OP/UNBIND。 */
    private String verifyScene;

    /** 校验结果：SUCCESS/FAIL/EXPIRED。 */
    private String verifyResult;

    /** 协议：SAML/OIDC/CAS。 */
    private String protocol;

    /** 提供商状态：DRAFT/ACTIVE/DISABLED。 */
    private String providerStatus;

    /** 角色编码。 */
    private String roleCode;

    /** 访问级别：HIDDEN/MASKED/READONLY/EDITABLE。 */
    private String accessLevel;

    /** 权限状态：ACTIVE/DISABLED。 */
    private String permStatus;

    /** 风险级别：HIGH/MEDIUM/LOW。 */
    private String riskLevel;

    /** 规则状态：ACTIVE/DISABLED。 */
    private String ruleStatus;

    /** 处理状态：OPEN/HANDLING/RESOLVED/IGNORED。 */
    private String handleStatus;

    /** 业务模块：PLM/ERP/SRM/MES/WMS/OA。 */
    private String bizModule;

    /** 数据表。 */
    private String tableName;

    /** 用户名。 */
    private String username;

    /** 起始日期（yyyy-MM-dd）。 */
    private String startDate;

    /** 结束日期（yyyy-MM-dd）。 */
    private String endDate;
}
