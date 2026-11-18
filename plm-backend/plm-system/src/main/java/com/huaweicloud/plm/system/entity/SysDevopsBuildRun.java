package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 构建部署记录（G1-N7 公共平台底座—DevSecOps WBS T012）：
 * 逐次记录流水线运行：构建号、环境、提交号、结果、起止时间、耗时与制品引用，
 * 作为可追溯的交付记录。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_devops_build_run")
public class SysDevopsBuildRun extends BaseEntity {

    /** 运行编号（唯一，支持人工指定）。 */
    private String runNo;

    /** 流水线编码（必填）。 */
    private String pipelineCode;

    /** 构建号。 */
    private String buildNo;

    /** 环境编码。 */
    private String envCode;

    /** 提交号。 */
    private String commitId;

    /** 构建状态：RUNNING/SUCCESS/FAILED/CANCELED，默认 RUNNING。 */
    private String buildStatus;

    /** 开始时间。 */
    private LocalDateTime startTime;

    /** 结束时间。 */
    private LocalDateTime endTime;

    /** 耗时（毫秒）。 */
    private Long durationMs;

    /** 制品引用。 */
    private String artifactRef;

    /** 消息。 */
    private String message;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
