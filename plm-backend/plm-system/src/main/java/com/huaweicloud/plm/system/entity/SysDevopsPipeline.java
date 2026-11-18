package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 流水线（G1-N7 公共平台底座—DevSecOps WBS T012）：
 * 登记 CI/CD 流水线，关联仓库与触发方式（推送/手动/定时），
 * 作为自动化测试、制品构建与部署的统一编排入口。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_devops_pipeline")
public class SysDevopsPipeline extends BaseEntity {

    /** 流水线编号（唯一，支持人工指定）。 */
    private String pipelineNo;

    /** 流水线编码（必填且唯一）。 */
    private String pipelineCode;

    /** 流水线名称。 */
    private String pipelineName;

    /** 关联仓库编码。 */
    private String repoCode;

    /** 触发方式：PUSH/MANUAL/SCHEDULE，默认 PUSH。 */
    private String triggerType;

    /** 流水线状态：ACTIVE/INACTIVE，默认 ACTIVE。 */
    private String pipelineStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
