package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 治理任务保存请求（G1-N7 治理中心 T001 项目治理）。
 */
@Data
public class SysGovTaskSaveRequest {

    /** 任务编号（为空时自动生成）。 */
    private String taskNo;

    /** 所属项目编码。 */
    @NotBlank(message = "所属项目编码不能为空")
    private String projectCode;

    /** 所属里程碑编码。 */
    private String milestoneCode;

    /** 任务名称。 */
    @NotBlank(message = "任务名称不能为空")
    private String taskName;

    /** 任务类型，为空默认 DELIVERY。 */
    private String taskType;

    /** 负责人。 */
    private String assignee;

    /** 计划开始时间。 */
    private LocalDateTime planStart;

    /** 计划结束时间。 */
    private LocalDateTime planEnd;

    /** 实际结束时间。 */
    private LocalDateTime actualEnd;

    /** 进度百分比（0-100），为空默认 0。 */
    private Integer progress;

    /** 任务状态，为空默认 TODO。 */
    private String taskStatus;

    /** 任务优先级，为空默认 P1。 */
    private String taskPriority;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
