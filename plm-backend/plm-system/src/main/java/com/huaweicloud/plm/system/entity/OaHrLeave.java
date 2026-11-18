package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 请假单：员工请假申请，审批由 OA-N3 工作流引擎承载。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_hr_leave")
public class OaHrLeave extends BaseEntity {

    private String leaveNo;

    private Long applicantUserId;

    private String applicantName;

    private Long orgId;

    private String orgName;

    /** 请假类型：可配置字典，默认 PERSONAL。 */
    private String leaveType;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private BigDecimal leaveDays;

    private String reason;

    private String attachmentJson;

    /** 流程状态：DRAFT/RUNNING/APPROVED/REJECTED/CANCELLED。 */
    private String flowStatus;

    private Long instanceId;

    private String instanceNo;

    private Integer cancelFlag;

    private Integer makeUpFlag;

    private String remark;
}
