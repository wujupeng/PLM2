package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 质量问题措施与验证记录（DEV-049）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("quality_issue_action")
public class QualityIssueAction extends BaseEntity {

    /** 所属问题单 ID。 */
    private Long issueId;

    /** 措施类型：containment/root_cause/corrective/preventive/verify。 */
    private String actionType;

    /** 措施内容。 */
    private String content;

    /** 责任人 ID。 */
    private Long ownerId;

    /** 责任人姓名。 */
    private String ownerName;

    /** 计划完成日期。 */
    private LocalDate dueDate;

    /** 实际完成时间。 */
    private LocalDateTime completedAt;

    /** 措施结果。 */
    private String result;

    /** 验证证据。 */
    private String evidence;

    /** 状态：open/done/verified。 */
    private String status;

    private String remark;
}
