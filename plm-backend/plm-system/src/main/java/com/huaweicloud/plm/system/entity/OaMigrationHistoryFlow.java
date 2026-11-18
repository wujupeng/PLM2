package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 历史流程档案（OA-DEV-102）：已完结/已终止流程的表单快照、审批意见、处理人与时间线只读留存。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_migration_history_flow")
public class OaMigrationHistoryFlow extends BaseEntity {

    /** 档案编号。 */
    private String archiveNo;

    /** 源流程单号。 */
    private String sourceInstanceNo;

    /** 流程编码。 */
    private String processCode;

    /** 流程名称。 */
    private String processName;

    /** 流程标题。 */
    private String title;

    /** 表单快照（JSON）。 */
    private String formSnapshot;

    /** 发起人姓名。 */
    private String applicantName;

    /** 发起人组织快照。 */
    private String applicantOrg;

    /** 发起时间。 */
    private LocalDateTime startTime;

    /** 结束时间。 */
    private LocalDateTime endTime;

    /** 实例状态：RUNNING/APPROVED/REJECTED/CANCELLED。 */
    private String instanceStatus;

    /** 审批意见（JSON）。 */
    private String approvalJson;

    /** 处理时间线（JSON）。 */
    private String timelineJson;

    /** 附件数量。 */
    private Integer attachmentCount;

    /** 是否已迁移：0/1。 */
    private Integer migratedFlag;

    /** 原查询人姓名快照。 */
    private String queryUserName;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
