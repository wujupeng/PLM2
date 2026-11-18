package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 职责分离违规记录保存请求（G1-N4 公共平台底座—身份与权限增强 WBS T008 权限审计）。
 */
@Data
public class SysSodViolationSaveRequest {

    /** 违规编号（为空时自动生成）。 */
    private String violationNo;

    /** 规则编号。 */
    @NotBlank(message = "规则编号不能为空")
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

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
