package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 安全问题（N9，DEV-102）：安全测试发现的问题、整改与验证闭环，支撑高危清零。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("int_security_issue")
public class IntSecurityIssue extends BaseEntity {

    /** 问题编号（唯一）。 */
    private String issueNo;

    /** 问题类别：AUTH/INJECTION/SENSITIVE_DATA/PERMISSION/CONFIG。 */
    private String category;

    /** 严重程度：CRITICAL/HIGH/MEDIUM/LOW。 */
    private String severity;

    /** 问题标题。 */
    private String title;

    /** 问题详情。 */
    private String detail;

    /** 发现人。 */
    private String discoveredBy;

    /** 发现时间。 */
    private LocalDateTime discoveredAt;

    /** 状态：OPEN/FIXING/FIXED/VERIFIED/CLOSED。 */
    private String status;

    /** 整改方案。 */
    private String fixPlan;

    /** 整改时间。 */
    private LocalDateTime fixedAt;

    /** 验证人。 */
    private String verifier;

    /** 验证时间。 */
    private LocalDateTime verifiedAt;

    private String remark;
}
