package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 缺陷（N9，DEV-106）：质保运维与缺陷处理，按 SLA 记录响应与修复时限及升级情况。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("int_defect")
public class IntDefect extends BaseEntity {

    /** 缺陷编号（唯一）。 */
    private String defectNo;

    /** 来源：UAT/PRODUCTION/TEST/SECURITY。 */
    private String source;

    /** 严重程度：CRITICAL/MAJOR/MINOR。 */
    private String severity;

    /** 缺陷标题。 */
    private String title;

    /** 缺陷详情。 */
    private String detail;

    /** 所属模块。 */
    private String module;

    /** 发现时间。 */
    private LocalDateTime foundAt;

    /** SLA 响应时限（小时）。 */
    private Integer slaResponseHours;

    /** SLA 修复时限（小时）。 */
    private Integer slaFixHours;

    /** 响应时间。 */
    private LocalDateTime responseAt;

    /** 修复时间。 */
    private LocalDateTime fixedAt;

    /** 验证时间。 */
    private LocalDateTime verifiedAt;

    /** 状态：OPEN/ASSIGNED/FIXING/FIXED/VERIFIED/CLOSED。 */
    private String status;

    /** 升级级别，0 表示未升级。 */
    private Integer escalationLevel;

    /** 处理人。 */
    private String assignee;

    /** 是否超期：1 超期 / 0 未超期。 */
    private Integer slaBreached;

    private String remark;
}
