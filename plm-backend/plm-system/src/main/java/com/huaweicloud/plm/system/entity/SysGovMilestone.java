package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 治理中心—项目治理—里程碑（G1-N7 公共平台底座 WBS T001 项目治理）：
 * 登记所属项目、计划/实际达成时间、状态（PENDING/...）与交付物，
 * 用于项目进度与交付节点的统一追踪。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_gov_milestone")
public class SysGovMilestone extends BaseEntity {

    /** 里程碑编号（唯一，支持人工指定）。 */
    private String milestoneNo;

    /** 所属项目编码。 */
    private String projectCode;

    /** 里程碑编码。 */
    private String milestoneCode;

    /** 里程碑名称。 */
    private String milestoneName;

    /** 计划达成时间。 */
    private LocalDateTime planDate;

    /** 实际达成时间。 */
    private LocalDateTime actualDate;

    /** 里程碑状态，默认 PENDING。 */
    private String milestoneStatus;

    /** 负责人。 */
    private String ownerName;

    /** 交付物。 */
    private String deliverable;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
