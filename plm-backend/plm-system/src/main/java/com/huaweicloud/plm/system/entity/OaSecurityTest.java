package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 安全测试（OA-DEV-107）：记录扫描编码、检查项类型/级别、目标、工具、问题与整改验证结果。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_security_test")
public class OaSecurityTest extends BaseEntity {

    /** 扫描编码。 */
    private String scanNo;

    /** 检查项名称。 */
    private String checkName;

    /** 检查类型：CODE_SCAN/PENETRATION/VULNERABILITY。 */
    private String checkType;

    /** 风险级别：CRITICAL/HIGH/MEDIUM/LOW。 */
    private String severity;

    /** 检查目标。 */
    private String target;

    /** 使用的工具。 */
    private String toolName;

    /** 发现的问题。 */
    private String finding;

    /** 整改建议。 */
    private String suggestion;

    /** 整改状态：OPEN/FIXED/ACCEPTED。 */
    private String fixStatus;

    /** 是否接受风险：0/1。 */
    private Integer riskAccepted;

    /** 验证结果。 */
    private String verifyResult;

    /** 测试执行人。 */
    private String tester;

    /** 测试时间。 */
    private LocalDateTime testTime;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
