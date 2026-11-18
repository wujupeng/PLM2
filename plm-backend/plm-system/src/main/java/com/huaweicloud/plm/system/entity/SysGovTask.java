package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 治理中心—项目治理—治理任务（G1-N7 公共平台底座 WBS T001 项目治理）：
 * 登记所属项目/里程碑、任务类型（DELIVERY/...）、负责人、计划/实际时间、
 * 进度（0-100）与优先级（P0/P1/P2...）及状态（TODO/...），支撑项目执行的可追踪。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_gov_task")
public class SysGovTask extends BaseEntity {

    /** 任务编号（唯一，支持人工指定）。 */
    private String taskNo;

    /** 所属项目编码。 */
    private String projectCode;

    /** 所属里程碑编码。 */
    private String milestoneCode;

    /** 任务名称。 */
    private String taskName;

    /** 任务类型，默认 DELIVERY。 */
    private String taskType;

    /** 负责人。 */
    private String assignee;

    /** 计划开始时间。 */
    private LocalDateTime planStart;

    /** 计划结束时间。 */
    private LocalDateTime planEnd;

    /** 实际结束时间。 */
    private LocalDateTime actualEnd;

    /** 进度百分比（0-100），默认 0。 */
    private Integer progress;

    /** 任务状态，默认 TODO。 */
    private String taskStatus;

    /** 任务优先级，默认 P1。 */
    private String taskPriority;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
