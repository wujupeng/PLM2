package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 职责分离违规记录（G1-N4 公共平台底座—身份与权限增强 WBS T008 权限审计）：
 * 同一用户同时命中互斥项即生成违规记录，供权限审计复核与整改追踪。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_sod_violation")
public class SysSodViolation extends BaseEntity {

    /** 违规编号（唯一，支持人工指定）。 */
    private String violationNo;

    /** 规则编号。 */
    private String ruleNo;

    /** 规则名称。 */
    private String ruleName;

    /** 用户ID。 */
    private Long userId;

    /** 用户名。 */
    private String username;

    /** 冲突明细。 */
    private String conflictDetail;

    /** 风险级别：HIGH/MEDIUM/LOW。 */
    private String riskLevel;

    /** 处理状态：OPEN/HANDLING/RESOLVED/IGNORED。 */
    private String handleStatus;

    /** 处理人。 */
    private String handler;

    /** 处理时间。 */
    private LocalDateTime handleTime;

    /** 处理说明。 */
    private String handleNote;

    /** 检测时间。 */
    private LocalDateTime detectTime;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
