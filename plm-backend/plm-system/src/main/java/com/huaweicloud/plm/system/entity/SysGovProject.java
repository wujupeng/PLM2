package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 治理中心—项目治理（G1-N7 公共平台底座 WBS T001 项目治理）：
 * 登记项目章程要点（编号、类型、范围、组织、进度），
 * 作为里程碑、治理任务与风险/问题/变更的统一台账主键。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_gov_project")
public class SysGovProject extends BaseEntity {

    /** 项目编号（唯一，支持人工指定）。 */
    private String projectNo;

    /** 项目编码。 */
    private String projectCode;

    /** 项目名称。 */
    private String projectName;

    /** 项目类型，默认 PLATFORM。 */
    private String projectType;

    /** 项目发起人。 */
    private String sponsor;

    /** 项目经理。 */
    private String managerName;

    /** 计划开始时间。 */
    private LocalDateTime startDate;

    /** 计划结束时间。 */
    private LocalDateTime endDate;

    /** 项目状态，默认 PLANNING。 */
    private String projectStatus;

    /** 项目范围说明。 */
    private String scopeDesc;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
